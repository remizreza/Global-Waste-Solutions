#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/var/www/redoxy-erp"

echo "Deploying REDOXY ERP to ${APP_DIR}"
cd "${APP_DIR}"

if [ ! -f ".env" ]; then
  echo "Missing ${APP_DIR}/.env"
  exit 1
fi

npm install
npm run build
npm run lint

if command -v pm2 >/dev/null 2>&1; then
  pm2 startOrReload deploy/pm2.ecosystem.config.cjs
  pm2 save
  echo "PM2 reload complete"
else
  echo "PM2 not found. Use systemd or install pm2."
fi

echo "Deployment completed"
