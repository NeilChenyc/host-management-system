#!/usr/bin/env python3
import argparse
import os
import socket
import time
import logging
import uuid
import hashlib
import platform
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


def get_machine_identifier():
    """Generate a unique machine identifier based on hardware characteristics."""
    try:
        # Get MAC address
        mac = ':'.join(['{:02x}'.format((uuid.getnode() >> elements) & 0xff) 
                       for elements in range(0, 2*6, 2)][::-1])
        
        # Get hostname
        hostname = socket.gethostname()
        
        # Get platform info
        system_info = f"{platform.system()}-{platform.machine()}-{platform.processor()}"
        
        # Create a unique identifier
        unique_string = f"{mac}-{hostname}-{system_info}"
        machine_id = hashlib.md5(unique_string.encode()).hexdigest()[:16]
        
        return machine_id
    except Exception:
        # Fallback to a random UUID if hardware detection fails
        return str(uuid.uuid4())[:16]


def get_server_id_file_path():
    """Get the path to store server ID locally."""
    # Store in the same directory as the script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    return os.path.join(script_dir, '.server_id')


def load_stored_server_id():
    """Load server ID from local file if it exists."""
    server_id_file = get_server_id_file_path()
    if os.path.exists(server_id_file):
        try:
            with open(server_id_file, 'r') as f:
                return int(f.read().strip())
        except (ValueError, IOError):
            pass
    return None


def store_server_id(server_id: int):
    """Store server ID to local file."""
    server_id_file = get_server_id_file_path()
    try:
        with open(server_id_file, 'w') as f:
            f.write(str(server_id))
    except IOError as e:
        logging.warning(f"Failed to store server ID: {e}")


def get_system_info():
    """Get system information for server registration."""
    try:
        # Get CPU info
        cpu_info = platform.processor() or "Unknown CPU"
        if not cpu_info or cpu_info == "Unknown CPU":
            # Try to get more detailed CPU info
            try:
                import cpuinfo
                cpu_info = cpuinfo.get_cpu_info().get('brand_raw', 'Unknown CPU')
            except ImportError:
                cpu_info = f"{platform.machine()} CPU"
        
        # Get memory info
        memory = psutil.virtual_memory()
        memory_gb = round(memory.total / (1024**3))
        memory_info = f"{memory_gb}GB"
        
        # Get OS info
        os_info = f"{platform.system()} {platform.release()}"
        
        # Get IP address
        hostname = socket.gethostname()
        ip_address = socket.gethostbyname(hostname)
        
        return {
            'cpu': cpu_info,
            'memory': memory_info,
            'operating_system': os_info,
            'ip_address': ip_address,
            'hostname': hostname
        }
    except Exception as e:
        logging.warning(f"Failed to get system info: {e}")
        return {
            'cpu': 'Unknown CPU',
            'memory': 'Unknown',
            'operating_system': 'Unknown OS',
            'ip_address': '127.0.0.1',
            'hostname': socket.gethostname()
        }


def register_server(conn, machine_id: str, system_info: dict, logger) -> int:
    """Register a new server in the database."""
    server_name = f"{system_info['hostname']}-{machine_id[:8]}"
    
    with conn.cursor() as cur:
        # Check if server already exists by machine_id (stored in server_name for uniqueness)
        cur.execute(
            "SELECT id FROM servers WHERE server_name LIKE %s",
            (f"%-{machine_id[:8]}",)
        )
        existing = cur.fetchone()
        if existing:
            logger.info(f"Found existing server registration: server_id={existing[0]}")
            return int(existing[0])
        
        # Insert new server
        cur.execute("""
            INSERT INTO servers (server_name, ip_address, cpu, memory, operating_system, status, created_at, updated_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """, (
            server_name,
            system_info['ip_address'],
            system_info['cpu'],
            system_info['memory'],
            system_info['operating_system'],
            'online',
            datetime.now(),
            datetime.now()
        ))
        
        server_id = cur.fetchone()[0]
        logger.info(f"Registered new server: server_id={server_id}, name={server_name}")
        return int(server_id)


def resolve_server_id(conn, cfg, logger) -> int:
    """
    Resolve server ID with automatic registration and binding to local machine.
    Priority:
    1. Check config file for explicit server_id
    2. Check local stored server_id file
    3. Auto-register new server and bind to this machine
    """
    # Method 1: Check config file for explicit server_id
    server_identification = cfg.get('server_identification', {})
    if server_identification:
        sid = server_identification.get('server_id')
        if sid:
            logger.info(f"Using server_id from config: {sid}")
            # Store this ID locally for future use
            store_server_id(int(sid))
            return int(sid)

    # Method 2: Check local stored server_id
    stored_id = load_stored_server_id()
    if stored_id:
        # Verify this server still exists in database
        with conn.cursor() as cur:
            cur.execute("SELECT id FROM servers WHERE id = %s", (stored_id,))
            if cur.fetchone():
                logger.info(f"Using stored server_id: {stored_id}")
                return stored_id
            else:
                logger.warning(f"Stored server_id {stored_id} not found in database, will re-register")

    # Method 3: Auto-register new server
    logger.info("No valid server_id found, registering new server...")
    
    # Generate machine identifier
    machine_id = get_machine_identifier()
    logger.info(f"Generated machine identifier: {machine_id}")
    
    # Get system information
    system_info = get_system_info()
    logger.info(f"System info: {system_info}")
    
    # Register server in database
    server_id = register_server(conn, machine_id, system_info, logger)
    
    # Store server_id locally for future use
    store_server_id(server_id)
    
    return server_id


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
            # Convert load average to percentage: (load_avg / cpu_count) * 100
            load_avg_raw = psutil.getloadavg()[0]  # 1-minute load average
            cpu_count = psutil.cpu_count()
            load_avg = (load_avg_raw / cpu_count) * 100  # Convert to percentage
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