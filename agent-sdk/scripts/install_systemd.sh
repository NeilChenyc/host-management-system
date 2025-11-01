#!/usr/bin/env bash
set -euo pipefail

# System Health Agent Systemd Installation Script
# This script installs the agent as a systemd service

# Configuration
INSTALL_DIR="/opt/system-health-agent"
SERVICE_USER="agent"
SERVICE_GROUP="agent"
SERVICE_FILE="system-health-agent.service"

echo "System Health Agent Systemd Installation"
echo "========================================"

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo "ERROR: This script must be run as root (use sudo)"
   exit 1
fi

# Check if systemd is available
if ! command -v systemctl >/dev/null 2>&1; then
   echo "ERROR: systemd is not available on this system"
   exit 1
fi

# Check if required files exist
if [[ ! -f "agent-sdk/system_health_agent.py" ]]; then
   echo "ERROR: system_health_agent.py not found"
   echo "Please run this script from the project root directory."
   exit 1
fi

if [[ ! -f "agent-sdk/systemd/$SERVICE_FILE" ]]; then
   echo "ERROR: $SERVICE_FILE not found"
   exit 1
fi

echo "Creating service user and group..."
# Create service user and group if they don't exist
if ! getent group "$SERVICE_GROUP" >/dev/null 2>&1; then
   groupadd --system "$SERVICE_GROUP"
   echo "Created group: $SERVICE_GROUP"
fi

if ! getent passwd "$SERVICE_USER" >/dev/null 2>&1; then
   useradd --system --gid "$SERVICE_GROUP" --home-dir "$INSTALL_DIR" \
           --shell /bin/false --comment "System Health Agent" "$SERVICE_USER"
   echo "Created user: $SERVICE_USER"
fi

echo "Creating installation directory..."
# Create installation directory
mkdir -p "$INSTALL_DIR"
mkdir -p /var/log/system-health-agent

echo "Installing agent files..."
# Copy agent files
cp agent-sdk/system_health_agent.py "$INSTALL_DIR/"
cp agent-sdk/config.example.yaml "$INSTALL_DIR/config.yaml"
cp agent-sdk/README.md "$INSTALL_DIR/" 2>/dev/null || true

# Set permissions
chown -R "$SERVICE_USER:$SERVICE_GROUP" "$INSTALL_DIR"
chown -R "$SERVICE_USER:$SERVICE_GROUP" /var/log/system-health-agent
chmod 755 "$INSTALL_DIR"
chmod 644 "$INSTALL_DIR/system_health_agent.py"
chmod 600 "$INSTALL_DIR/config.yaml"

echo "Installing systemd service..."
# Install systemd service
cp "agent-sdk/systemd/$SERVICE_FILE" /etc/systemd/system/
chmod 644 "/etc/systemd/system/$SERVICE_FILE"

# Reload systemd
systemctl daemon-reload

echo "Installation completed successfully!"
echo ""
echo "Next steps:"
echo "1. Edit the configuration file: $INSTALL_DIR/config.yaml"
echo "2. Install Python dependencies: pip3 install psutil psycopg2-binary PyYAML"
echo "3. Enable the service: systemctl enable $SERVICE_FILE"
echo "4. Start the service: systemctl start $SERVICE_FILE"
echo "5. Check status: systemctl status $SERVICE_FILE"
echo "6. View logs: journalctl -u $SERVICE_FILE -f"