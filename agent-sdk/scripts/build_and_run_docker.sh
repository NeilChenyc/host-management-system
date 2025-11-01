#!/usr/bin/env bash
set -euo pipefail

# Docker Build and Run Script for System Health Agent
# This script builds and runs the agent in a Docker container

# Configuration
IMAGE_NAME=${IMAGE_NAME:-system-health-agent:latest}
CONFIG_PATH=${CONFIG_PATH:-"$(pwd)/agent-sdk/config.yaml"}
CONTAINER_NAME=${CONTAINER_NAME:-system-health-agent}

echo "System Health Agent Docker Deployment"
echo "======================================"

# Validate configuration file exists
if [[ ! -f "$CONFIG_PATH" ]]; then
  echo "ERROR: Config file not found at $CONFIG_PATH"
  echo "Please copy agent-sdk/config.example.yaml to $CONFIG_PATH and edit it."
  exit 1
fi

# Validate Docker is available
if ! command -v docker >/dev/null 2>&1; then
  echo "ERROR: Docker is not installed or not in PATH"
  exit 1
fi

# Check if agent-sdk directory exists
if [[ ! -d "agent-sdk" ]]; then
  echo "ERROR: agent-sdk directory not found"
  echo "Please run this script from the project root directory."
  exit 1
fi

echo "Building Docker image: $IMAGE_NAME"
echo "Using config: $CONFIG_PATH"
echo "Container name: $CONTAINER_NAME"
echo "----------------------------------------"

# Build the Docker image using agent-sdk as context
echo "Building Docker image..."
docker build -t "$IMAGE_NAME" -f agent-sdk/docker/Dockerfile agent-sdk

echo "Docker image built successfully!"

# Stop and remove existing container if it exists
if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
  echo "Stopping and removing existing container: $CONTAINER_NAME"
  docker stop "$CONTAINER_NAME" >/dev/null 2>&1 || true
  docker rm "$CONTAINER_NAME" >/dev/null 2>&1 || true
fi

echo "Starting container..."
# Run the container with the configuration mounted
docker run -d \
  --name "$CONTAINER_NAME" \
  --restart unless-stopped \
  -v "$CONFIG_PATH:/app/config.yaml:ro" \
  "$IMAGE_NAME" \
  --config /app/config.yaml

echo "Container started successfully!"
echo "Container name: $CONTAINER_NAME"
echo ""
echo "To view logs: docker logs -f $CONTAINER_NAME"
echo "To stop: docker stop $CONTAINER_NAME"
echo "To remove: docker rm $CONTAINER_NAME"