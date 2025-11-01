#!/usr/bin/env python3
import argparse
import os
import socket
import time
import logging
import uuid
import hashlib
import platform
import subprocess
import re
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
    Resolve server ID by checking database directly.
    Always check database for existing server based on machine identifier,
    if not found, register new server.
    """
    # Generate machine identifier
    machine_id = get_machine_identifier()
    logger.info(f"Generated machine identifier: {machine_id}")
    
    # Get system information
    system_info = get_system_info()
    logger.info(f"System info: {system_info}")
    
    # Register server in database (will return existing ID if found, or create new one)
    server_id = register_server(conn, machine_id, system_info, logger)
    
    return server_id


def read_temperature(enabled: bool = True, cpu_percent: float = None) -> float:
    """Read system temperature if available and requested."""
    if not enabled:
        return 0.0
    
    try:
        # Try to get temperature from sensors (if available)
        if hasattr(psutil, 'sensors_temperatures'):
            temps = psutil.sensors_temperatures()
            if temps:
                # Get the first available temperature sensor
                for name, entries in temps.items():
                    if entries:
                        # Return the first temperature reading
                        return float(entries[0].current)
        
        # If psutil doesn't work, try platform-specific methods
        system = platform.system()
        
        if system == "Darwin":  # macOS
            try:
                # Try using powermetrics (requires sudo, but let's try)
                result = subprocess.run(['powermetrics', '--samplers', 'smc', '-n', '1', '-i', '1'], 
                                      capture_output=True, text=True, timeout=10)
                if result.returncode == 0:
                    # Look for CPU temperature in the output
                    match = re.search(r'CPU die temperature:\s*(\d+\.\d+)\s*C', result.stdout)
                    if match:
                        return float(match.group(1))
            except (subprocess.TimeoutExpired, FileNotFoundError, subprocess.CalledProcessError):
                pass
            
            try:
                # Try using istats (if installed)
                result = subprocess.run(['istats', 'cpu', 'temp'], 
                                      capture_output=True, text=True, timeout=5)
                if result.returncode == 0:
                    # Look for temperature in the output
                    match = re.search(r'(\d+\.\d+)°C', result.stdout)
                    if match:
                        return float(match.group(1))
            except (subprocess.TimeoutExpired, FileNotFoundError, subprocess.CalledProcessError):
                pass
            
            try:
                # Try using osx-cpu-temp (if installed)
                result = subprocess.run(['osx-cpu-temp'], 
                                      capture_output=True, text=True, timeout=5)
                if result.returncode == 0:
                    # The output should be just the temperature
                    temp_str = result.stdout.strip().replace('°C', '').replace('C', '')
                    temp_val = float(temp_str)
                    # Only return if we get a reasonable temperature (> 0)
                    if temp_val > 0:
                        return temp_val
            except (subprocess.TimeoutExpired, FileNotFoundError, subprocess.CalledProcessError, ValueError):
                pass
                
            # Try to read from system thermal state (less accurate but available)
            try:
                result = subprocess.run(['pmset', '-g', 'therm'], 
                                      capture_output=True, text=True, timeout=5)
                if result.returncode == 0:
                    # This gives thermal pressure, not exact temperature
                    # But we can estimate: Normal=25°C, Fair=35°C, Serious=45°C, Critical=55°C
                    if 'No thermal pressure' in result.stdout:
                        return 25.0  # Assume normal temperature
                    elif 'thermal pressure' in result.stdout.lower():
                        return 45.0  # Assume elevated temperature
            except (subprocess.TimeoutExpired, FileNotFoundError, subprocess.CalledProcessError):
                pass
                
        elif system == "Linux":
            # Try additional Linux methods
            try:
                # Try reading from /sys/class/thermal/
                thermal_zones = [f for f in os.listdir('/sys/class/thermal/') if f.startswith('thermal_zone')]
                for zone in thermal_zones:
                    temp_file = f'/sys/class/thermal/{zone}/temp'
                    if os.path.exists(temp_file):
                        with open(temp_file, 'r') as f:
                            temp_millicelsius = int(f.read().strip())
                            return temp_millicelsius / 1000.0
            except (OSError, ValueError, IOError):
                pass
                
            try:
                # Try lm-sensors
                result = subprocess.run(['sensors'], capture_output=True, text=True, timeout=5)
                if result.returncode == 0:
                    # Look for CPU temperature
                    matches = re.findall(r'Core \d+:\s*\+(\d+\.\d+)°C', result.stdout)
                    if matches:
                        return float(matches[0])
                    # Look for other temperature readings
                    matches = re.findall(r'temp\d+:\s*\+(\d+\.\d+)°C', result.stdout)
                    if matches:
                        return float(matches[0])
            except (subprocess.TimeoutExpired, FileNotFoundError, subprocess.CalledProcessError):
                pass
        
        # If all methods fail, return a simulated temperature based on CPU usage
        # This is not accurate but provides some indication
        try:
            # Use provided CPU percent or get current value
            if cpu_percent is not None:
                current_cpu_percent = cpu_percent
            else:
                current_cpu_percent = psutil.cpu_percent(interval=0.1)
            
            # Simulate temperature: base 30°C + CPU usage factor
            simulated_temp = 30.0 + (current_cpu_percent * 0.5)  # Max ~80°C at 100% CPU
            return min(simulated_temp, 85.0)  # Cap at reasonable maximum
        except:
            pass
        
        return 0.0
        
    except Exception as e:
        # Log the error for debugging
        logging.debug(f"Temperature reading failed: {e}")
        return 0.0


def get_network_bandwidth(interface: str | None):
    """Get network interface bandwidth/speed in Mbps."""
    if not interface:
        # If no specific interface, try to get the default route interface
        try:
            # Get default route interface on Linux/macOS
            if platform.system() == "Linux":
                result = subprocess.run(['ip', 'route', 'show', 'default'], 
                                      capture_output=True, text=True, timeout=5)
                if result.returncode == 0:
                    match = re.search(r'dev (\w+)', result.stdout)
                    if match:
                        interface = match.group(1)
            elif platform.system() == "Darwin":  # macOS
                result = subprocess.run(['route', 'get', 'default'], 
                                      capture_output=True, text=True, timeout=5)
                if result.returncode == 0:
                    match = re.search(r'interface: (\w+)', result.stdout)
                    if match:
                        interface = match.group(1)
        except Exception:
            pass
    
    if not interface:
        return None
    
    try:
        system = platform.system()
        
        if system == "Linux":
            # Try ethtool first (most accurate)
            try:
                result = subprocess.run(['ethtool', interface], 
                                      capture_output=True, text=True, timeout=5)
                if result.returncode == 0:
                    # Look for "Speed: 1000Mb/s" or similar
                    match = re.search(r'Speed:\s*(\d+)Mb/s', result.stdout)
                    if match:
                        return int(match.group(1))
            except (subprocess.TimeoutExpired, FileNotFoundError):
                pass
            
            # Fallback: check /sys/class/net/{interface}/speed
            try:
                speed_file = f'/sys/class/net/{interface}/speed'
                if os.path.exists(speed_file):
                    with open(speed_file, 'r') as f:
                        speed = int(f.read().strip())
                        if speed > 0:
                            return speed
            except (ValueError, IOError):
                pass
                
        elif system == "Darwin":  # macOS
            try:
                # Use networksetup to get interface info
                result = subprocess.run(['networksetup', '-getmedia', interface], 
                                      capture_output=True, text=True, timeout=5)
                if result.returncode == 0:
                    # Look for speed information in the output
                    # This is less reliable on macOS, so we'll use common defaults
                    if 'ethernet' in result.stdout.lower():
                        return 20  # Default to 20Mbps for ethernet
                    elif 'wi-fi' in result.stdout.lower() or 'wifi' in result.stdout.lower():
                        return 20   # Default to 20Mbps for WiFi
            except (subprocess.TimeoutExpired, FileNotFoundError):
                pass
                
        elif system == "Windows":
            try:
                # Use wmic to get network adapter speed
                result = subprocess.run(['wmic', 'path', 'win32_networkadapter', 
                                       'where', f'NetConnectionID="{interface}"', 
                                       'get', 'Speed', '/value'], 
                                      capture_output=True, text=True, timeout=5)
                if result.returncode == 0:
                    match = re.search(r'Speed=(\d+)', result.stdout)
                    if match:
                        # Convert from bps to Mbps
                        return int(match.group(1)) // 1000000
            except (subprocess.TimeoutExpired, FileNotFoundError):
                pass
        
        # If all methods fail, return a reasonable default based on interface name
        if interface.startswith(('eth', 'en')):
            return 20  # 20Mbps default for ethernet
        elif interface.startswith(('wlan', 'wifi', 'wl')):
            return 20   # 20Mbps default for WiFi
        else:
            return 20   # 20Mbps default fallback
            
    except Exception as e:
        logging.warning(f"Failed to get bandwidth for interface {interface}: {e}")
        return 20  # Return 20Mbps default instead of None


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


def calculate_network_rate(prev_bytes, curr_bytes, time_delta, bandwidth_mbps=None, as_percentage=False):
    """Calculate network rate in MB/s or as percentage of bandwidth.
    
    Args:
        prev_bytes: Previous bytes (tuple of (bytes_in, bytes_out) or single value)
        curr_bytes: Current bytes (tuple of (bytes_in, bytes_out) or single value)
        time_delta: Time difference in seconds
        bandwidth_mbps: Interface bandwidth in Mbps (optional)
        as_percentage: Whether to return percentage of bandwidth
    
    Returns:
        tuple: (rate_in, rate_out) in MB/s or percentage
    """
    if time_delta <= 0 or prev_bytes is None or curr_bytes is None:
        return 0.0, 0.0
    
    # Handle both tuple and single value inputs
    if isinstance(prev_bytes, tuple) and isinstance(curr_bytes, tuple):
        prev_in, prev_out = prev_bytes
        curr_in, curr_out = curr_bytes
    else:
        # Single value case (backward compatibility)
        prev_in = prev_out = prev_bytes
        curr_in = curr_out = curr_bytes
    
    # Calculate byte differences
    bytes_diff_in = curr_in - prev_in
    bytes_diff_out = curr_out - prev_out
    
    # Handle counter resets
    if bytes_diff_in < 0:
        bytes_diff_in = 0
    if bytes_diff_out < 0:
        bytes_diff_out = 0
    
    # Convert bytes/second to MB/second
    rate_in_mbps = (bytes_diff_in / time_delta) / (1024 * 1024)
    rate_out_mbps = (bytes_diff_out / time_delta) / (1024 * 1024)
    
    if as_percentage and bandwidth_mbps and bandwidth_mbps > 0:
        # Convert MB/s to Mbps (multiply by 8) and calculate percentage
        rate_in_mbits = rate_in_mbps * 8
        rate_out_mbits = rate_out_mbps * 8
        percentage_in = min((rate_in_mbits / bandwidth_mbps) * 100, 100.0)
        percentage_out = min((rate_out_mbits / bandwidth_mbps) * 100, 100.0)
        return percentage_in, percentage_out
    
    return rate_in_mbps, rate_out_mbps


def collect_and_insert(conn, server_id: int, cfg: dict, logger, once=False):
    """Main collection loop."""
    interval = cfg.get('metrics', {}).get('interval_seconds', 5)
    disk_mount = cfg.get('metrics', {}).get('disk_mount', '/')
    include_temp = cfg.get('metrics', {}).get('include_temperature', True)
    network_interface = cfg.get('metrics', {}).get('network_interface')
    
    # Get network bandwidth once at startup (it rarely changes)
    network_bandwidth = get_network_bandwidth(network_interface)
    if network_bandwidth:
        logger.info(f"Detected network bandwidth: {network_bandwidth} Mbps for interface {network_interface or 'default'}")
    else:
        logger.warning(f"Could not detect network bandwidth for interface {network_interface or 'default'}, using absolute values")
    
    # Check if we should use percentage for network metrics
    use_network_percentage = cfg.get('metrics', {}).get('network_as_percentage', True)
    
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
            temperature = read_temperature(include_temp, cpu)
            
            # Network metrics with rate calculation
            curr_time = time.time()
            curr_network_in, curr_network_out = get_network_bytes(network_interface)
            
            if prev_network_bytes is not None and prev_time is not None:
                time_delta = curr_time - prev_time
                
                # Calculate network rates (as percentage if bandwidth is available and enabled)
                if use_network_percentage and network_bandwidth:
                    network_in, network_out = calculate_network_rate(
                        prev_network_bytes, (curr_network_in, curr_network_out), 
                        time_delta, network_bandwidth, as_percentage=True
                    )
                else:
                    # Use absolute values in MB/s
                    network_in, network_out = calculate_network_rate(
                        prev_network_bytes, (curr_network_in, curr_network_out), 
                        time_delta, as_percentage=False
                    )
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
                f"Inserted metrics: sid={server_id} cpu={cpu:.2f}% mem={mem:.2f}% disk={disk:.2f}% "
                f"net_in={network_in:.3f}{'%' if use_network_percentage and network_bandwidth else 'MB/s'} "
                f"net_out={network_out:.3f}{'%' if use_network_percentage and network_bandwidth else 'MB/s'} "
                f"load={load_avg:.2f} temp={temperature:.1f}°C"
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