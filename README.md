# REDOXY ERP

Independent REDOXY ERP companion app with:

- React frontend
- Express backend
- App-level user login
- Server-side Odoo credentials
- Embedded database-backed app users and settings
- Odoo as the accounting engine

## Prerequisites

- Node.js 20+
- npm 10+

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` from `.env.example` and set:

- `APP_JWT_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- optional Odoo credentials

3. Start frontend and backend together:

```bash
npm run dev:all
```

Frontend runs on `http://localhost:5173`

Backend runs on `http://localhost:3001`

4. Build for production:

```bash
npm run build
```

5. Run backend only:

```bash
npm run server
```

6. Preview the production build:

```bash
npm run preview
```

## Odoo Connection

Open the app, sign in with the bootstrap admin account, then go to `Odoo Settings` and enter:

- Odoo URL
- Database name
- Username / email
- Odoo API key
- Report Session Password only when PDF view/download needs the real Odoo password for browser-session auth

The app stores Odoo credentials on the backend in region-local NeDB files under `server/data/`.

App users and settings are stored in NeDB files under `server/data/`.

## Roles

- `admin`: manage users, manage Odoo settings, create/write/post accounting records
- `accountant`: create/write/post accounting records
- `viewer`: read-only access

## Passwords

- Users can change their own password from `Odoo Settings`
- Admins can reset another user password and force password rotation on next login

## Accounting Actions

The app now includes first-pass operational actions for:

- creating draft customer invoices
- creating draft vendor bills
- creating balanced draft journal entries
- posting existing invoices, bills, and journal entries

## Project Structure

```text
src/
  api/
  components/
  hooks/
  lib/
  pages/
  utils/
server/
  data/
  index.js
  odoo.js
```

## Notes

- Odoo data is fetched through the Express backend, not directly from the browser.
- PDF/report download on Odoo Online can require the actual Odoo password even when XML-RPC data calls work with an API key.
- The app supports host-based region selection:
  - `ksa.redoxyksa.com` -> KSA source settings and SAR display
  - `uae.redoxyksa.com` -> UAE source settings and AED display
- Sample Nginx configs are included for:
  - `deploy/nginx/ksa.redoxyksa.com.conf`
  - `deploy/nginx/uae.redoxyksa.com.conf`
- For production you should terminate TLS in Nginx or Cloudflare and proxy `/api` to the backend.

## Production URLs

- KSA: `https://ksa.redoxyksa.com`
- UAE: `https://uae.redoxyksa.com`

Do not use `go.redoxyksa.com` as the operational ERP entrypoint.

## Safe Deploy Rule

- Deploy code and build output only.
- Do not overwrite `.env`.
- Do not overwrite `server/data`.
- Keep KSA and UAE app directories separate on the server.
