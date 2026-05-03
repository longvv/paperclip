#!/usr/bin/env bash
# vps-setup-swap.sh — Run once to add swap + auto-maintenance cron on the VPS.
# Usage: bash scripts/vps-setup-swap.sh
set -euo pipefail

VPS_HOST="root@178.105.29.2"

echo "🔧 Configuring VPS swap + maintenance on ${VPS_HOST}..."

ssh "${VPS_HOST}" bash -s <<'INNEREOF'
  set -euo pipefail

  # ── 1. Swap (4 GB) ─────────────────────────────────────────────────────────
  if swapon --show | grep -q /swapfile; then
    echo "✅ Swap already active: $(swapon --show)"
  else
    echo "📦 Creating 4 GB swapfile..."
    fallocate -l 4G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile

    # Persist across reboots
    if ! grep -q '/swapfile' /etc/fstab; then
      echo '/swapfile none swap sw 0 0' >> /etc/fstab
    fi

    # Tune swappiness (use swap only under pressure)
    sysctl vm.swappiness=10
    echo 'vm.swappiness=10' >> /etc/sysctl.conf

    echo "✅ Swap active: $(free -h | grep Swap)"
  fi

  # ── 2. Weekly Docker cleanup cron ───────────────────────────────────────────
  CRON_JOB="0 3 * * 0 docker system prune --volumes -f >> /var/log/docker-cleanup.log 2>&1"
  CRON_FILE="/etc/cron.d/docker-cleanup"

  if [ -f "${CRON_FILE}" ]; then
    echo "✅ Cleanup cron already installed."
  else
    echo "🕒 Installing weekly Docker cleanup cron (Sundays 03:00 UTC)..."
    echo "${CRON_JOB}" > "${CRON_FILE}"
    chmod 644 "${CRON_FILE}"
    echo "✅ Cron installed: ${CRON_FILE}"
  fi

  # ── 3. Current status ───────────────────────────────────────────────────────
  echo ""
  echo "=== Current VPS state ==="
  echo "Memory:"; free -h
  echo "Disk:";   df -h /
  echo "Swap:";   swapon --show || echo "(none)"
INNEREOF

echo ""
echo "✅ VPS swap + maintenance configured."
