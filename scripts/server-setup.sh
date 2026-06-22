#!/usr/bin/env bash
# ============================================================
# BrickQuote Pro — Ubuntu Server Initial Setup
# Run once on a fresh Ubuntu 22.04 LTS dedicated server.
# Usage: sudo bash scripts/server-setup.sh
# ============================================================
set -euo pipefail

APP_USER="brickquote"
APP_DIR="/opt/brickquotepro"
DOMAIN="brickquotepro.com"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " BrickQuote Pro — Server Setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ── 1. System updates ──────────────────────────────────────
apt-get update && apt-get upgrade -y
apt-get install -y curl wget git nginx certbot python3-certbot-nginx ufw fail2ban

# ── 2. Docker ──────────────────────────────────────────────
if ! command -v docker &>/dev/null; then
  curl -fsSL https://get.docker.com | bash
  systemctl enable --now docker
fi

if ! command -v docker-compose &>/dev/null; then
  apt-get install -y docker-compose-plugin
fi

# ── 3. App user ────────────────────────────────────────────
if ! id "$APP_USER" &>/dev/null; then
  useradd -m -s /bin/bash "$APP_USER"
  usermod -aG docker "$APP_USER"
fi

# ── 4. App directory ───────────────────────────────────────
mkdir -p "$APP_DIR"
chown "$APP_USER:$APP_USER" "$APP_DIR"

# ── 5. Firewall ────────────────────────────────────────────
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# ── 6. Fail2ban ────────────────────────────────────────────
systemctl enable --now fail2ban

# ── 7. Nginx ──────────────────────────────────────────────
systemctl enable --now nginx

# ── 8. SSL (Certbot) — run after DNS is pointed ───────────
echo ""
echo "⚡ Once your DNS A record points to this server's IP, run:"
echo "   certbot --nginx -d $DOMAIN -d www.$DOMAIN"
echo ""
echo "✅ Server setup complete. Deploy the app:"
echo "   1. cp .env.example $APP_DIR/.env && nano $APP_DIR/.env"
echo "   2. cp docker-compose.yml $APP_DIR/"
echo "   3. cd $APP_DIR && docker compose up -d"
echo "   4. cp nginx/brickquotepro.conf /etc/nginx/sites-available/$DOMAIN"
echo "   5. ln -s /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/"
echo "   6. nginx -t && systemctl reload nginx"
