# Global-Waste-Solutions
Repository for https://replit.com/@remizccj/Global-Waste-Solutions

## Vercel Auto Deploy (GitHub Actions)
Set these repository secrets to enable automatic production deploys on every push to `main`:
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

Workflow file: `.github/workflows/main.yml`.

## Branching note
- Open pull requests with `main` as the base branch.

## Update the Home hero introduction video
1. Copy your new MP4 file into `client/public/assets/` and name it `hero-introduction.mp4`.
2. Keep the current query string (`?v=1`) in `client/src/pages/Home.tsx`, and bump it (`?v=2`, `?v=3`, etc.) each time you replace the video to avoid stale browser cache.
3. Run the app (`npm run dev`) or production build (`npm run build`) to verify the video plays.

The Home page now points to `/assets/hero-introduction.mp4` and automatically falls back to `/assets/hero-bg-20260226-v2.mp4` if the new upload is missing or fails to load.

## Admin dashboard environment variables
Set these in Vercel Project Settings (and optionally GitHub Actions secrets if your workflow needs them):
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `ADMIN_TOKEN_SECRET`

Optional upstream market data connectors:
- `INVESTING_API_URL`
- `INVESTING_API_KEY`
- `MIDDLEEAST_TRADES_API_URL`
- `MIDDLEEAST_TRADES_API_KEY`

## Admin control center endpoints
The hosted admin backend now exposes these protected endpoints:
- `GET /api/admin/session` — validate signed admin session and expiry
- `GET /api/admin/control-center` — load hosted backend status, services, actions, logs, and latest market snapshot
- `POST /api/admin/actions` — run backend actions such as feed sync, bulletin refresh, and runtime checks
