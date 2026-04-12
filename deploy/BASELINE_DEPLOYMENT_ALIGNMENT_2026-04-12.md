# Baseline deployment alignment report

Date: 2026-04-12 (UTC)

## What was verified in this terminal session

1. **Repository working tree baseline**
   - Branch: `work`
   - Working tree was clean before checks.

2. **GitHub connectivity baseline**
   - No Git remote is currently configured in this local clone (`.git/config` contains no `origin`).
   - Because no remote URL is present, this terminal cannot fetch/pull/push or compare local state against GitHub yet.

3. **Vercel deployment baseline**
   - Deployment pipeline exists at `.github/workflows/main.yml` and is configured to deploy on pushes to `main`.
   - `vercel.json` is present and configured for production build output (`dist/public`) with API and SPA rewrites.
   - Local build completed successfully with `npm run build`.

4. **Vercel CLI auth/connectivity status in this environment**
   - Installing/running Vercel CLI from npm failed in this container due a registry access restriction (`403 Forbidden`), so direct `vercel pull/list/deployments` validation could not be executed here.

## Alignment conclusion

- **Code + config are internally aligned** for a Vercel production deploy workflow (GitHub Actions + `vercel.json` + successful build).
- **External alignment with live Vercel deployment and GitHub remote cannot be fully confirmed from this terminal** until:
  1. a Git remote is added, and
  2. Vercel CLI/API access is available in this environment.

## Next commands to finish external alignment (once credentials/network access are available)

```bash
# 1) Connect GitHub remote
git remote add origin <github-repo-url>
git fetch origin
git branch -u origin/work work

# 2) Link Vercel project and inspect production deployment
vercel link
vercel project ls
vercel ls
vercel inspect <deployment-url-or-id>
```
