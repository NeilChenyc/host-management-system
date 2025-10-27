#!/usr/bin/env python3
import argparse
import os
import socket
import time
import logging
from datetime import datetime

import yaml
import psutil
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT


def load_config(path: str) -> dict:
    with open(path, 'r', encoding='utf-8') as f:
        return yaml.safe_load(f)


def get_logger(level: str = 'INFO'):
    logging.basicConfig(
        level=getattr(logging, level.upper(), logging.INFO),
        format='[%(asctime)s] %(levelname)s %(message)s'
    )
    return logging.getLogger('system-health-agent')


def db_connect(cfg: dict):
    db = cfg['db']
    conn = psycopg2.connect(
        host=db['host'],
        port=db.get('port', 5432),
        dbname=db['database'],
        user=db['user'],
        password=db['password'],
        sslmode=db.get('sslmode', 'prefer')
    )
    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    return conn


def resolve_server_id(conn, cfg, logger) -> int:
    sid = cfg.get('server_identification', {}).get('server_id')
    if sid:
        return int(sid)

    name = cfg.get('server_identification', {}).get('server_name')
    auto_ip = cfg.get('server_identification', {}).get('auto_detect_ip', True)
    ip = None
    if auto_ip:
        try:
            hostname = socket.gethostname()
            ip = socket.gethostbyname(hostname)
        except Exception as e:
            logger.warning(f"Auto detect IP failed: {e}")

    with conn.cursor() as cur:
        cur.execute(
            "SELECT id FROM servers WHERE server_name = %s OR ip_address = %s LIMIT 1",
            (name, ip)
        )
        row = cur.fetchone()
        if not row:
            logger.error("Server ID not found by name/IP. Please set server_id in config or ensure servers table has an entry.")
            raise RuntimeError("SERVER_ID_NOT_FOUND")
        return int(row[0])


def read_temperature(include: bool):
    """Read system temperature if available and requested."""
    if not include:
        return 0.0
    
    try:
        # Try to get temperature from sensors
        temps = psutil.sensors_temperatures()
        if not temps:
            return 0.0
        
        # Get the first available temperature sensor
        for name, entries in temps.items():
            if entries:
                # Return the first temperature reading
                return float(entries[0].current)
        
        return 0.0
    except (AttributeError, OSError, Exception):
        # sensors_temperatures() may not be available on all platforms
        # or may raise exceptions on some systems
        return 0.0


def get_network_bytes(interface: str | None):
    """Get network bytes in/out for the specified interface (or all interfaces)."""
    try:
        net_io = psutil.net_io_counters(pernic=True) if interface else psutil.net_io_counters()
        if interface:
            if interface in net_io:
                stats = net_io[interface]
                return stats.bytes_recv, stats.bytes_sent
            else:
                # Interface not found, return 0
                return 0, 0
        else:
            # Sum all interfaces
            return net_io.bytes_recv, net_io.bytes_sent
    except Exception:
        return 0, 0


def calculate_network_rate(prev_bytes, curr_bytes, time_delta):
    """Calculate network rate in MB/s given previous and current bytes and time delta."""
    if time_delta <= 0 or prev_bytes is None:
        return 0.0
    
    bytes_diff = curr_bytes - prev_bytes
    if bytes_diff < 0:
        # Counter reset, return 0
        return 0.0
    
    # Convert bytes/second to MB/second
    return (bytes_diff / time_delta) / (1024 * 1024)


def collect_and_insert(conn, server_id: int, cfg: dict, logger, once=False):
    """Main collection loop."""
    interval = cfg.get('metrics', {}).get('interval_seconds', 5)
    disk_mount = cfg.get('metrics', {}).get('disk_mount', '/')
    include_temp = cfg.get('metrics', {}).get('include_temperature', True)
    network_interface = cfg.get('metrics', {}).get('network_interface')
    
    # Initialize network tracking variables
    prev_network_bytes = None
    prev_time = None
    
    while True:
        try:
            # Collect metrics
            cpu = psutil.cpu_percent(interval=1)
            mem = psutil.virtual_memory().percent
            disk = psutil.disk_usage(disk_mount).percent
            load_avg = psutil.getloadavg()[0]  # 1-minute load average
            temperature = read_temperature(include_temp)
            
            # Network metrics with rate calculation
            curr_time = time.time()
            curr_network_in, curr_network_out = get_network_bytes(network_interface)
            
            if prev_network_bytes is not None and prev_time is not None:
                time_delta = curr_time - prev_time
                network_in = calculate_network_rate(prev_network_bytes[0], curr_network_in, time_delta)
                network_out = calculate_network_rate(prev_network_bytes[1], curr_network_out, time_delta)
            else:
                # First run, no previous data
                network_in = 0.0
                network_out = 0.0
            
            # Update tracking variables
            prev_network_bytes = (curr_network_in, curr_network_out)
            prev_time = curr_time
            
            # Ensure temperature is not None for database insertion
            if temperature is None:
                temperature = 0.0
            
            collected_at = datetime.now()

            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO server_metrics (
                        server_id, cpu_usage, memory_usage, disk_usage,
                        network_in, network_out, load_avg, temperature, collected_at
                    ) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)
                    """,
                    (
                        server_id, cpu, mem, disk,
                        network_in, network_out, load_avg, temperature, collected_at
                    )
                )
                conn.commit()  # Ensure data is committed
            logger.debug(
                f"Inserted metrics: sid={server_id} cpu={cpu:.2f}% mem={mem:.2f}% disk={disk:.2f}% net_in={network_in:.3f}MB/s net_out={network_out:.3f}MB/s load={load_avg:.2f} temp={temperature:.1f}°C"
            )

        except (psycopg2.Error,) as db_err:
            logger.error(f"DB error: {db_err}. Reconnecting in 5s...")
            time.sleep(5)
            try:
                conn = db_connect(cfg)
                logger.info("Database reconnected successfully")
            except Exception as reconnect_err:
                logger.error(f"Failed to reconnect to database: {reconnect_err}")
                time.sleep(5)
                continue
        except Exception as e:
            logger.error(f"Collect/Insert error: {e}")

        if once:
            break
        
        time.sleep(interval)


def main():
    parser = argparse.ArgumentParser(description='System Health Agent')
    parser.add_argument('--config', required=True, help='Path to config.yaml')
    parser.add_argument('--once', action='store_true', help='Run one collection cycle and exit')
    args = parser.parse_args()

    cfg = load_config(args.config)
    logger = get_logger(cfg.get('logging', {}).get('level', 'INFO'))

    # DB connect with retry logic
    max_retries = 5
    retry_count = 0
    conn = None
    
    while retry_count < max_retries:
        try:
            conn = db_connect(cfg)
            logger.info('Connected to PostgreSQL')
            break
        except Exception as e:
            retry_count += 1
            logger.error(f'Failed to connect to database (attempt {retry_count}/{max_retries}): {e}')
            if retry_count < max_retries:
                time.sleep(5)
            else:
                logger.error('Max database connection retries exceeded. Exiting.')
                return

    # Resolve server id
    try:
        server_id = resolve_server_id(conn, cfg, logger)
        logger.info(f'Resolved server_id={server_id}')
    except Exception as e:
        logger.error(f'Failed to resolve server_id: {e}. Exiting.')
        return

    try:
        collect_and_insert(conn, server_id, cfg, logger, once=args.once)
    except KeyboardInterrupt:
        logger.info('Received interrupt signal. Shutting down gracefully.')
    except Exception as e:
        logger.error(f'Unexpected error in main loop: {e}')
    finally:
        if conn:
            try:
                conn.close()
                logger.info('Database connection closed.')
            except Exception:
                pass


if __name__ == '__main__':
    main()