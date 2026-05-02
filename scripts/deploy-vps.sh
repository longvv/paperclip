#!/usr/bin/env bash
set -euo pipefail

VPS_HOST="root@178.105.29.2"
VPS_DIR="/opt/paperclip"

echo "🚀 Deploying Paperclip to ${VPS_HOST}..."

# 1. Bootstrap VPS (idempotent)
echo "📦 Bootstrapping VPS..."
bash scripts/vps-bootstrap.sh

# 2. Sync code to VPS
echo "📡 Syncing code to VPS..."
rsync -avz --delete \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='data/' \
  --exclude='dist/' \
  --exclude='.trae/' \
  --exclude='.env' \
  --exclude='*.md' \
  ./ "${VPS_HOST}:${VPS_DIR}/"

# 3. Build and deploy on VPS
echo "🔨 Building and deploying on VPS..."
ssh "${VPS_HOST}" bash -s <<'INNEREOF'
  set -euo pipefail
  cd /opt/paperclip
  
  # Build Docker image
  echo "Building Docker image..."
  docker compose build --no-cache
  
  # Deploy
  echo "Starting services..."
  docker compose up -d
  
  # Clean up old images
  echo "Cleaning up old images..."
  docker image prune -f
  
  echo "✅ Deploy complete!"
  echo "📊 Service status:"
  docker compose ps
INNEREOF

echo ""
echo "========================================="
echo "✅ Deployment complete!"
echo "🌐 Access Paperclip at: http://178.105.29.2:3100"
echo "📊 Logs: ssh ${VPS_HOST} 'docker compose -f /opt/paperclip/docker-compose.yml logs -f'"
echo "========================================="
