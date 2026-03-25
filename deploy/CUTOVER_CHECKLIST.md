# Production Cutover Checklist

## Target

- KSA ERP URL: `https://ksa.redoxyksa.com`
- UAE ERP URL: `https://uae.redoxyksa.com`
- Website remains on Vercel at `https://redoxyksa.com`

## Server

1. Provision Ubuntu/Debian VPS
2. Install:
   - Node.js 20+
   - npm
   - nginx
   - certbot
   - pm2
3. Create app folders:

```bash
sudo mkdir -p /var/www/redoxy-erp-ksa
sudo mkdir -p /var/www/redoxy-erp-uae
sudo chown -R $USER:$USER /var/www/redoxy-erp-ksa
sudo chown -R $USER:$USER /var/www/redoxy-erp-uae
```

4. Upload project into both region folders

## Environment

1. Copy:

```bash
cp deploy/.env.production.ksa.example /var/www/redoxy-erp-ksa/.env
cp deploy/.env.production.uae.example /var/www/redoxy-erp-uae/.env
```

2. Fill:
   - region admin bootstrap credentials
   - Odoo credentials if using env defaults
   - JWT secret
   - SMTP credentials
   - optional Google Drive credentials

## App

1. Run:

```bash
cd /var/www/redoxy-erp-ksa && npm install && npm run build
cd /var/www/redoxy-erp-uae && npm install && npm run build
pm2 start deploy/pm2.ecosystem.multi.config.cjs
pm2 save
```

## Nginx

1. Install config:

```bash
sudo cp deploy/nginx/ksa.redoxyksa.com.conf /etc/nginx/sites-available/ksa.redoxyksa.com.conf
sudo cp deploy/nginx/uae.redoxyksa.com.conf /etc/nginx/sites-available/uae.redoxyksa.com.conf
sudo ln -sf /etc/nginx/sites-available/ksa.redoxyksa.com.conf /etc/nginx/sites-enabled/ksa.redoxyksa.com.conf
sudo ln -sf /etc/nginx/sites-available/uae.redoxyksa.com.conf /etc/nginx/sites-enabled/uae.redoxyksa.com.conf
sudo nginx -t
sudo systemctl reload nginx
```

## DNS

1. Create `A` records:
   - host: `ksa`
   - host: `uae`
   - value: your VPS public IP

## SSL

1. Run:

```bash
sudo certbot --nginx -d ksa.redoxyksa.com -d uae.redoxyksa.com
```

## Smoke Test

1. Open `https://ksa.redoxyksa.com`
2. Login as KSA admin
3. Verify dashboard load and SAR display
4. Verify KSA Odoo connection
5. Verify KSA print/download/email flow
6. Open `https://uae.redoxyksa.com`
7. Login as UAE admin
8. Verify dashboard load and AED display
9. Verify UAE Odoo connection
10. Verify UAE print/download/email flow

## Safe Ops Rule

- Never overwrite `.env` during code deploy
- Never overwrite `server/data` during code deploy
- Never copy KSA `server/data` into UAE or vice versa
