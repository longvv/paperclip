#!/usr/bin/env bash
set -euo pipefail

VPS_HOST="root@178.105.29.2"
VPS_DIR="/opt/paperclip"

echo "🚀 Bootstrapping VPS at ${VPS_HOST}..."

ssh "${VPS_HOST}" bash -s <<'EOF'
  set -euo pipefail

  # Install Docker if not present
  if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    curl -fsSL https://get.docker.com | sh
    usermod -aG docker root
  fi

  # Install Docker Compose plugin if not present
  if ! docker compose version &> /dev/null; then
    echo "Installing Docker Compose plugin..."
    apt update && apt install -y docker-compose-plugin
  fi

  # Create deployment directory
  mkdir -p /opt/paperclip
  mkdir -p /opt/paperclip/data

  echo "✅ VPS bootstrap complete"
EOF

echo "✅ Bootstrap complete"
