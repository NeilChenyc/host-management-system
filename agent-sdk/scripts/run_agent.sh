#!/usr/bin/env bash
set -euo pipefail

# System Health Agent Runner Script
# This script runs the agent with proper error handling and logging

# Configuration
CONFIG_PATH=${CONFIG_PATH:-"$(pwd)/agent-sdk/config.yaml"}
PYTHON_CMD=${PYTHON_CMD:-python3}
AGENT_SCRIPT="$(pwd)/agent-sdk/system_health_agent.py"

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

# Check Python dependencies
echo "Checking Python dependencies..."
if ! $PYTHON_CMD -c "import psutil, psycopg2, yaml" 2>/dev/null; then
  echo "ERROR: Missing required Python dependencies."
  echo "Please install: pip install psutil psycopg2-binary PyYAML"
  exit 1
fi

echo "Starting System Health Agent..."
echo "Config: $CONFIG_PATH"
echo "Agent: $AGENT_SCRIPT"
echo "Python: $PYTHON_CMD"
echo "----------------------------------------"

# Run the agent with proper signal handling
exec $PYTHON_CMD "$AGENT_SCRIPT" --config "$CONFIG_PATH"