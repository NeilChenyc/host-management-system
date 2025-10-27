#!/usr/bin/env bash
set -euo pipefail

# System Health Agent Test Script
# This script tests the agent functionality without database insertion

# Configuration
CONFIG_PATH=${CONFIG_PATH:-"$(pwd)/agent-sdk/config.yaml"}
PYTHON_CMD=${PYTHON_CMD:-python3}
AGENT_SCRIPT="$(pwd)/agent-sdk/system_health_agent.py"

echo "System Health Agent Test Suite"
echo "=============================="

# Validate configuration file exists
if [[ ! -f "$CONFIG_PATH" ]]; then
  echo "ERROR: Config file not found at $CONFIG_PATH"
  echo "Please copy agent-sdk/config.example.yaml to $CONFIG_PATH and edit it."
  exit 1
fi

# Validate agent script exists
if [[ ! -f "$AGENT_SCRIPT" ]]; then
  echo "ERROR: Agent script not found at $AGENT_SCRIPT"
  echo "Please ensure you're running this script from the project root directory."
  exit 1
fi

echo "Testing Python dependencies..."
# Test Python dependencies
MISSING_DEPS=()
for dep in psutil psycopg2 yaml; do
  if ! $PYTHON_CMD -c "import $dep" 2>/dev/null; then
    MISSING_DEPS+=("$dep")
  fi
done

if [[ ${#MISSING_DEPS[@]} -gt 0 ]]; then
  echo "ERROR: Missing Python dependencies: ${MISSING_DEPS[*]}"
  echo "Please install: pip install psutil psycopg2-binary PyYAML"
  exit 1
fi
echo "✓ All Python dependencies are available"

echo ""
echo "Testing system metrics collection..."

# Test system metrics collection
$PYTHON_CMD -c "
import sys
sys.path.append('$(pwd)/agent-sdk')
from system_health_agent import get_cpu_usage, get_memory_usage, get_disk_usage, get_load_average, read_temperature, get_network_bytes

print('Testing CPU usage:', get_cpu_usage())
print('Testing Memory usage:', get_memory_usage())
print('Testing Disk usage:', get_disk_usage('/'))
print('Testing Load average:', get_load_average())
print('Testing Temperature:', read_temperature())
print('Testing Network bytes:', get_network_bytes('en0'))
print('✓ All metric collection functions work correctly')
"

echo ""
echo "Testing configuration loading..."

# Test configuration loading
$PYTHON_CMD -c "
import sys
sys.path.append('$(pwd)/agent-sdk')
from system_health_agent import load_config

try:
    config = load_config('$CONFIG_PATH')
    print('✓ Configuration loaded successfully')
    print('  Database host:', config.get('database', {}).get('host', 'Not set'))
    print('  Server name:', config.get('server', {}).get('name', 'Not set'))
    print('  Collection interval:', config.get('metrics', {}).get('interval', 'Not set'))
except Exception as e:
    print('ERROR: Configuration loading failed:', e)
    sys.exit(1)
"

echo ""
echo "Testing database connection (without insertion)..."

# Test database connection
$PYTHON_CMD -c "
import sys
sys.path.append('$(pwd)/agent-sdk')
from system_health_agent import load_config, connect_to_database

try:
    config = load_config('$CONFIG_PATH')
    conn = connect_to_database(config)
    if conn:
        print('✓ Database connection successful')
        conn.close()
    else:
        print('⚠ Database connection failed (this may be expected if DB is not available)')
except Exception as e:
    print('⚠ Database connection test failed:', e)
    print('  This is expected if the database is not configured or available')
"

echo ""
echo "=========================================="
echo "Test Summary:"
echo "✓ Python dependencies check passed"
echo "✓ System metrics collection works"
echo "✓ Configuration loading works"
echo "⚠ Database connection test completed (may fail if DB not available)"
echo ""
echo "The agent appears to be working correctly!"
echo "To run the agent: ./agent-sdk/scripts/run_agent.sh"