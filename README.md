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
- `ADMIN_PASSWORD` (or `ADMIN_PASSWORD_HASH` for a scrypt hash in `salt:hex` format)
- `ADMIN_TOKEN_SECRET`

Optional upstream market data connectors:
- `INVESTING_API_URL`
- `INVESTING_API_KEY`
- `MIDDLEEAST_TRADES_API_URL`
- `MIDDLEEAST_TRADES_API_KEY`
- `VITE_SITE_LAST_PUBLISHED_AT` (optional; shown in website footer as "Website last published")

## IG live market connector
To source trader dashboard prices from IG, set these in Vercel Project Settings:
- `IG_API_KEY`
- `IG_USERNAME`
- `IG_PASSWORD`
- `IG_ACCOUNT_ID`
- `IG_API_BASE` (optional, defaults to `https://api.ig.com/gateway/deal`)
- `IG_EPIC_BRENT`
- `IG_EPIC_WTI`
- `IG_EPIC_NATURAL_GAS`
- `IG_EPIC_HEATING_OIL`
- `IG_EPIC_GASOLINE`

Notes:
- IG login requires username and password in addition to the API key.
- The board converts IG raw prices into `USD/mt` or `USD/mt eq` using product-specific assumptions.
- Natural gas is shown as LNG-equivalent using `52 MMBtu/mt`.
- If IG is unavailable or not fully configured, the dashboard falls back to internal defaults.

## Brent + Dubai proxy pricing script
A ready-to-run pricing helper is available at `script/redoxy_pricing_model.py`.

### What it does
- Pulls Brent (`function=BRENT`, daily) from Alpha Vantage.
- Pulls Dubai proxy (`DBLc1`) from Commodities-API.
- Applies REDOXY pricing formula:
  - `final_offer_usd_mt = benchmark_converted_usd_mt + broker_premium + freight + margin`

### Configure API keys
```bash
export ALPHA_VANTAGE_API_KEY="your_alpha_vantage_key"
export COMMODITIES_API_KEY="your_commodities_api_key"
```

### Example usage
```bash
python3 script/redoxy_pricing_model.py \
  --benchmark dubai \
  --broker-premium 18 \
  --freight 42 \
  --margin 15
```

Optional historical proxy pull:
```bash
python3 script/redoxy_pricing_model.py --benchmark dubai --commodities-date 2026-03-25
```

Note: `DBLc1` is a futures proxy and should not be treated as the licensed Platts Dubai/Oman physical assessment.
