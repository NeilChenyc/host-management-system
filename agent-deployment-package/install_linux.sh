#!/bin/bash

echo "========================================"
echo "  Installing Server Monitoring Agent"
echo "========================================"

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "Installing Python3..."
    
    if command -v apt-get &> /dev/null; then
        sudo apt-get update
        sudo apt-get install -y python3 python3-pip
    elif command -v yum &> /dev/null; then
        sudo yum install -y python3 python3-pip
    else
        echo "Please install Python3 manually"
        exit 1
    fi
fi

echo "Python found: $(python3 --version)"

# Install dependencies
echo "Installing dependencies..."
pip3 install psutil requests

if [ $? -ne 0 ]; then
    echo "Error: Failed to install dependencies"
    exit 1
fi

# Make agent executable
chmod +x server_agent.py

echo ""
echo "========================================"
echo "  Installation Complete!"
echo "========================================"
echo ""
echo "Configuration:"
cat agent_config.json
echo ""
echo "To start agent, run:"
echo "  python3 server_agent.py"
echo ""
