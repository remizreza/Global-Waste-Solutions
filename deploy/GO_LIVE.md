# REDOXY ERP Go-Live

## Production URLs

- `https://ksa.redoxyksa.com`
- `https://uae.redoxyksa.com`

## Admin Access

- KSA admin: `ajmal@redoxyksa.com`
- UAE admin: `remiz@redoxyksa.com`

## Deploy Steps

1. Upload or sync the project to:
   - `/var/www/redoxy-erp-ksa`
   - `/var/www/redoxy-erp-uae`
2. Keep each region’s `.env` in place:
   - `/var/www/redoxy-erp-ksa/.env`
   - `/var/www/redoxy-erp-uae/.env`
3. Do not overwrite `server/data`
4. Run build in each region:

```bash
cd /var/www/redoxy-erp-ksa && npm run build
cd /var/www/redoxy-erp-uae && npm run build
```

5. Restart PM2:

```bash
pm2 restart redoxy-erp-ksa-api
pm2 restart redoxy-erp-uae-api
```

6. Install the Nginx configs:

```bash
sudo cp deploy/nginx/ksa.redoxyksa.com.conf /etc/nginx/sites-available/ksa.redoxyksa.com.conf
sudo cp deploy/nginx/uae.redoxyksa.com.conf /etc/nginx/sites-available/uae.redoxyksa.com.conf
sudo ln -s /etc/nginx/sites-available/ksa.redoxyksa.com.conf /etc/nginx/sites-enabled/ksa.redoxyksa.com.conf
sudo ln -s /etc/nginx/sites-available/uae.redoxyksa.com.conf /etc/nginx/sites-enabled/uae.redoxyksa.com.conf
sudo nginx -t
sudo systemctl reload nginx
```

7. Add SSL for both domains.

## Fast Checklist

See [CUTOVER_CHECKLIST.md](/Users/redoxy/Downloads/odoo%20app/odoo%20app/deploy/CUTOVER_CHECKLIST.md).

## Daily Use

- KSA users open `https://ksa.redoxyksa.com`
- UAE users open `https://uae.redoxyksa.com`
- Log in with their app email/password
- Work entirely inside REDOXY ERP
- Odoo stays behind the app as the transaction engine

## PDF/Auth Note

- Use the Odoo API key for normal data calls.
- If PDF/report view/download fails on Odoo Online, set `Report Session Password` in the region’s `Odoo Settings` page to the real Odoo account password.
