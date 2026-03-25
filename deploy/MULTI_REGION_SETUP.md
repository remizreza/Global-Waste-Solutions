# REDOXY ERP Multi-Region Setup

## Regions

- KSA: `https://ksa.redoxyksa.com`
- UAE: `https://uae.redoxyksa.com`

## Server Layout

- `/var/www/redoxy-erp-ksa`
- `/var/www/redoxy-erp-uae`

## Ports

- KSA backend: `3001`
- UAE backend: `3002`

## Admin Access

- KSA admin: `ajmal@redoxyksa.com`
- UAE admin: `remiz@redoxyksa.com`

## Environment Files

- KSA: `deploy/.env.production.ksa.example`
- UAE: `deploy/.env.production.uae.example`

Each region keeps its own live `.env` in:

- `/var/www/redoxy-erp-ksa/.env`
- `/var/www/redoxy-erp-uae/.env`

## Nginx Files

- KSA: `deploy/nginx/ksa.redoxyksa.com.conf`
- UAE: `deploy/nginx/uae.redoxyksa.com.conf`

## PM2

Use:

```bash
pm2 start deploy/pm2.ecosystem.multi.config.cjs
pm2 save
```

## Odoo Source Strategy

- Use the in-app `Odoo Settings` page on each region host to save:
  - Odoo URL
  - Database Name
  - Username / Email
  - Odoo API Key
  - Report Session Password when PDF/report auth needs the real password
- KSA settings are edited on `https://ksa.redoxyksa.com`
- UAE settings are edited on `https://uae.redoxyksa.com`

The backend resolves the active source bucket from the request host, so KSA and UAE no longer share one Odoo settings record.

## Safe Deployment

- Sync code into `/var/www/redoxy-erp-ksa` and `/var/www/redoxy-erp-uae`
- Exclude:
  - `.env`
  - `server/data`
  - `node_modules`
  - `dist`
  - `.git`
- Rebuild each region locally on the server
- Restart:
  - `redoxy-erp-ksa-api`
  - `redoxy-erp-uae-api`

Never copy `server/data` from one region into the other.

## DNS

Create A records:

- `ksa.redoxyksa.com` -> your server IP
- `uae.redoxyksa.com` -> your server IP
