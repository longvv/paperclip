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

  # Pre-flight: auto-clean if disk > 80%
  DISK_USED=$(df / | awk 'NR==2 {gsub("%",""); print $5}')
  echo "💾 Disk usage: ${DISK_USED}%"
  if [ "${DISK_USED}" -gt 80 ]; then
    echo "⚠️  Disk at ${DISK_USED}% — pruning Docker build cache first..."
    docker builder prune -f
    echo "✅ Build cache cleared. Disk now at $(df / | awk 'NR==2 {print $5}')."
  fi

  # Build Docker image (uses layer cache for speed)
  echo "Building Docker image..."
  docker compose build

  # Deploy with cleanup of orphaned containers
  echo "Starting services..."
  docker compose up -d --remove-orphans

  # Post-deploy cleanup: prune dangling images + old build cache (keep 2GB)
  echo "🧹 Cleaning up Docker artifacts..."
  docker image prune -f
  docker builder prune --keep-storage=2GB -f

  echo "✅ Deploy complete!"
  echo "📊 Service status:"
  docker compose ps

  # Health check with retry
  echo ""
  echo "🏥 Verifying server health..."
  STATUS="unreachable"
  for i in $(seq 1 12); do
    STATUS=$(curl -sf http://localhost:3100/api/health | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('status','?'))" 2>/dev/null || echo "unreachable")
    if [ "${STATUS}" = "ok" ]; then
      echo "✅ Server healthy (attempt ${i}/12)"
      break
    fi
    echo "  ⏳ Waiting for server... (attempt ${i}/12, status=${STATUS})"
    sleep 5
  done
  if [ "${STATUS}" != "ok" ]; then
    echo "❌ Server did not become healthy after 60s — check logs:"
    docker compose logs server --tail=30
    exit 1
  fi

  echo ""
  echo "💾 Disk usage after deploy:"
  df -h /
INNEREOF

echo ""
echo "========================================="
echo "✅ Deployment complete!"
echo "🌐 Access Paperclip at: http://178.105.29.2:3100"
echo "📊 Logs: ssh ${VPS_HOST} 'docker compose -f /opt/paperclip/docker-compose.yml logs -f'"
echo "========================================="
