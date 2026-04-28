# VPS Auto-Deploy Plan for Paperclip

## Overview

Create a local script (`scripts/deploy-vps.sh`) that deploys the Paperclip monorepo to the user's VPS at `178.105.29.2` via SSH. The script will handle building the Docker image locally, transferring it, and deploying with proper configuration.

## User Decisions (From Brainstorming Session)

- **SSH Access**: Already Configured (no prompts needed)
- **Workflow**: Local Script - run `./scripts/deploy-vps.sh` from local machine
- **Data Storage**: Docker Volume on VPS

## Architecture

```
Local Machine                          VPS (178.105.29.2)
┌──────────────┐                       ┌──────────────────┐
│ deploy-vps.sh│── 1. SSH bootstrap ──▶│ Docker + Compose │
│              │                       │                  │
│              │── 2. Build + Push ──▶ │ Docker Image     │
│              │                       │                  │
│              │── 3. Deploy ──▶       │ docker compose   │
│              │                       │   up -d          │
└──────────────┘                       └──────────────────┘
```

## Implementation Steps

### Step 1: Create VPS Bootstrap Script

**File:** `scripts/vps-bootstrap.sh`

This script runs on the VPS via SSH to set up the environment:

```bash
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
```

### Step 2: Create Main Deploy Script

**File:** `scripts/deploy-vps.sh`

```bash
#!/usr/bin/env bash
set -euo pipefail

VPS_HOST="root@178.105.29.2"
VPS_DIR="/opt/paperclip"
IMAGE_NAME="paperclip-deploy"

echo "🚀 Deploying Paperclip to ${VPS_HOST}..."

# 1. Bootstrap VPS (idempotent)
echo "📦 Bootstrapping VPS..."
bash scripts/vps-bootstrap.sh

# 2. Update VPS config if doesn't exist
echo "📝 Setting up VPS config..."
ssh "${VPS_HOST}" bash -s <<'INNEREOF'
  set -euo pipefail
  
  # Only create .env if it doesn't exist
  if [ ! -f /opt/paperclip/.env ]; then
    # Generate a random secret for auth
    AUTH_SECRET=$(openssl rand -hex 32)
    
    cat > /opt/paperclip/.env <<EOF
  PAPERCLIP_PORT=3100
  PAPERCLIP_DATA_DIR=/opt/paperclip/data
  PAPERCLIP_PUBLIC_URL=http://178.105.29.2:3100
  BETTER_AUTH_SECRET=${AUTH_SECRET}
  PAPERCLIP_DEPLOYMENT_MODE=authenticated
  PAPERCLIP_DEPLOYMENT_EXPOSURE=private
  OPENAI_API_KEY=
  ANTHROPIC_API_KEY=
EOF
    echo "Created .env with generated BETTER_AUTH_SECRET"
    echo "Auth Secret: ${AUTH_SECRET}"
  fi
INNEREOF

# 3. Sync code to VPS (excluding local artifacts)
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

# 4. Build and deploy on VPS
echo "🔨 Building and deploying on VPS..."
ssh "${VPS_HOST}" bash -s <<'INNEREOF'
  set -euo pipefail
  cd /opt/paperclip
  
  # Build Docker image
  echo "Building Docker image..."
  docker compose -f docker-compose.quickstart.yml build --no-cache
  
  # Deploy
  echo "Starting services..."
  docker compose -f docker-compose.quickstart.yml up -d
  
  # Clean up old images
  echo "Cleaning up old images..."
  docker image prune -f
  
  echo "✅ Deploy complete!"
  echo "📊 Service status:"
  docker compose -f docker-compose.quickstart.yml ps
INNEREOF

echo ""
echo "========================================="
echo "✅ Deployment complete!"
echo "🌐 Access Paperclip at: http://178.105.29.2:3100"
echo "📊 Logs: ssh ${VPS_HOST} 'docker compose -f /opt/paperclip/docker-compose.quickstart.yml logs -f'"
echo "========================================="
```

### Step 3: Create Rollback Script

**File:** `scripts/vps-rollback.sh`

```bash
#!/usr/bin/env bash
set -euo pipefail

VPS_HOST="root@178.105.29.2"

echo "🔄 Rolling back to previous deployment..."

ssh "${VPS_HOST}" bash -s <<'EOF'
  set -euo pipefail
  cd /opt/paperclip
  
  # Stop current services
  docker compose -f docker-compose.quickstart.yml down
  
  # Find previous image (if exists)
  PREV_IMAGE=$(docker images paperclip-paperclip --format "{{.ID}}" | tail -n 2 | head -n 1)
  
  if [ -n "${PREV_IMAGE}" ]; then
    # Tag it as current
    docker tag ${PREV_IMAGE} paperclip-paperclip:latest
    docker compose -f docker-compose.quickstart.yml up -d
    echo "✅ Rolled back to previous version"
  else
    echo "❌ No previous version found"
    exit 1
  fi
EOF
```

### Step 4: Create Management Scripts

**File:** `scripts/vps-logs.sh`

```bash
#!/usr/bin/env bash
ssh root@178.105.29.2 'docker compose -f /opt/paperclip/docker-compose.quickstart.yml logs -f'
```

**File:** `scripts/vps-status.sh`

```bash
#!/usr/bin/env bash
ssh root@178.105.29.2 'docker compose -f /opt/paperclip/docker-compose.quickstart.yml ps'
```

### Step 5: Update Documentation

**File:** `doc/DEVELOPING.md` (add section)

Add a "VPS Deployment" section with:
- Quick deployment command
- Configuration options
- Troubleshooting tips
- Data backup instructions

## File Structure After Implementation

```
scripts/
├── deploy-vps.sh        # Main deployment script
├── vps-bootstrap.sh     # VPS setup script  
├── vps-rollback.sh      # Rollback to previous version
├── vps-logs.sh          # View live logs
└── vps-status.sh        # Check service status
```

## Configuration

The deployment uses `authenticated/private` mode by default:
- **Access**: `http://178.105.29.2:3100`
- **Auth**: Required (better-auth sessions)
- **Exposure**: Private (lower friction)
- **Data**: Persisted in `/opt/paperclip/data` on VPS

### Customization Options

To change the deployment configuration, edit the `.env` template in `scripts/deploy-vps.sh`:

```bash
PAPERCLIP_PORT=3100              # Change port
PAPERCLIP_PUBLIC_URL=...         # Set your domain
PAPERCLIP_DEPLOYMENT_EXPOSURE=public  # For internet-facing
OPENAI_API_KEY=...               # For local adapters
ANTHROPIC_API_KEY=...            # For local adapters
```

## Security Considerations

1. **Firewall**: Ensure port 3100 is allowed in VPS firewall
2. **Auth**: BETTER_AUTH_SECRET is auto-generated on first deploy
3. **HTTPS**: Consider adding Nginx + Let's Encrypt for production
4. **Backups**: Data is in `/opt/paperclip/data` - implement off-server backups

## Deployment Flow Summary

1. Run `./scripts/deploy-vps.sh` locally
2. Script bootstraps VPS (installs Docker if needed)
3. Code is synced via rsync
4. Docker image is built on VPS
5. Services are deployed with docker compose
6. Access at `http://178.105.29.2:3100`

## Verification Steps After Deploy

1. Check service status: `./scripts/vps-status.sh`
2. View logs: `./scripts/vps-logs.sh`
3. Access UI: `http://178.105.29.2:3100`
4. Test login flow (authenticated mode)
5. Verify data persistence (restart container)
