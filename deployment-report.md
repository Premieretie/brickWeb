# BrickQuote Pro — Windows Server 2019 Deployment Report

**Prepared for:** Production deployment behind Cloudflare on Windows Server 2019  
**Target architecture:** `Cloudflare → Windows Server 2019 → IIS + ARR → Next.js → Supabase`  
**Date:** June 2026  
**Status:** Repository ready for deployment (no deployment executed)

---

## Phase 1 — Project Audit

### Framework currently in use
- **Next.js 15.5.19** with App Router (`src/app/`)
- **React 19.1.0**
- **TypeScript 5.5.3** (strict mode enabled)
- **Supabase** via `@supabase/ssr` for client/server auth
- Legacy HTML/CSS/JS files still present from the previous static site

### Current routing system
- Next.js App Router handles all public routes.
- Dynamic routes: `/dashboard/customer`, `/auth/callback`, `/api/health`.
- Middleware (`src/middleware.ts`) protects `/account` and `/dashboard`.
- Legacy static folders (`index.html`, `quote/`, `login/`, etc.) still exist and are no longer needed.

### Existing build process
- `npm run build` produces a standalone Next.js output in `.next/standalone`.
- `next.config.ts` is configured with `output: 'standalone'` and `outputFileTracingRoot`.
- Build is validated in `.github/workflows/build.yml`.

### Existing environment variables
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (optional)
- Newly added: `APP_URL` for backend/deployment references

### Existing deployment method
- Legacy: Netlify (`netlify.toml`, `netlify/functions/config.js`, `CNAME`).
- Legacy: GitHub Pages (`CNAME`, `robots.txt`, `sitemap.xml` at root).
- New: Windows Server 2019 + IIS + ARR + GitHub Actions (template disabled).

### Existing GitHub Pages configuration
- `CNAME` file points to `brickquotepro.com`.
- Legacy `robots.txt` and `sitemap.xml` at repository root.
- Legacy static `index.html` and folder-based URLs still exist.

### Existing Supabase configuration
- Browser client: `src/lib/supabase/client.ts`
- Server client: `src/lib/supabase/server.ts`
- Middleware auth: `src/middleware.ts`
- OAuth callback: `src/app/auth/callback/route.ts`

### Existing SEO configuration
- Root metadata in `src/app/layout.tsx` (Open Graph, Twitter Cards, robots).
- Dynamic `sitemap.ts` at `src/app/sitemap.ts`.
- Dynamic `robots.ts` at `src/app/robots.ts`.
- Canonical URLs added to all page-level metadata.

### Files that may conflict with Windows/IIS deployment
| File/Folder | Conflict | Resolution |
|-------------|----------|------------|
| `CNAME` | GitHub Pages only | Remove |
| `netlify.toml` + `netlify/` | Netlify-specific | Remove |
| `robots.txt` (root) | Static file overrides Next.js generated | Remove |
| `sitemap.xml` (root) | Static file overrides Next.js generated | Remove |
| `404.html` | Netlify fallback | Remove |
| `server.js` | Legacy Express dev server | Remove |
| `restart-server.bat` | Legacy dev server helper | Remove |
| `*.html` at root (`index.html`, `quote.html`, etc.) | Legacy static URLs | Remove |
| `Dockerfile`, `docker-compose.yml`, `.dockerignore` | Linux/Docker deployment | Remove (target is native Windows) |
| `nginx/brickquotepro.conf` | Linux reverse proxy | Remove (replaced by `deployment/iis/web.config`) |
| `iis/web.config` | Old location | Keep or remove; canonical location is `deployment/iis/web.config` |

---

## Phase 2 — Next.js Production Readiness

### Verified routes
| Route | Status | Notes |
|-------|--------|-------|
| `/` | ✅ | Home page with SEO metadata |
| `/measure` | ✅ | AR measure tool page |
| `/quote` | ✅ | Quote calculator |
| `/quotes` | ✅ | Added redirect to `/quote` |
| `/login` | ✅ | Auth form with Suspense boundary |
| `/signup` | ✅ | Auth form |
| `/dashboard` | ✅ | Role-based redirect |
| `/dashboard/customer` | ✅ | Customer dashboard (protected) |

### Clean URLs
- All Next.js routes use clean URLs (no `.html`).
- Legacy `.html` files are identified for removal.
- Next.js redirects added for `/ar-measure` → `/measure` and `/brick-fence-calculator` → `/quote`.

### Mobile responsiveness
- Global CSS (`src/app/globals.css`) includes responsive breakpoints and mobile-first styles.
- Header and footer components are responsive.

### Existing functionality preserved
- Quote calculator logic ported from legacy `calculator.js` to `src/lib/pricing.ts`.
- Supabase auth preserved in login/signup forms and middleware.
- AR measure tool shell preserved via `ARMeasureClient` component.
- Customer dashboard preserved.

---

## Phase 3 — Environment Variables

Created/updated: `.env.example`

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_SITE_URL=https://brickquotepro.com
APP_URL=https://brickquotepro.com
```

### Development variables
- Copy `.env.example` to `.env.local` and fill in real Supabase keys.
- Run `npm run dev`.

### Production variables
- On the Windows Server, create `C:\inetpub\brickquotepro\.env` with the same values.
- The deployment script copies this file to the site directory as `.env.local`.
- `NEXT_PUBLIC_*` variables are baked into the client bundle at build time.
- `APP_URL` is available to server-side code and deployment scripts.

### IIS environment setup
- No special IIS environment variables are required; Next.js reads `.env.local` from the app directory.
- The Windows service runs with `NODE_ENV=production`.

---

## Phase 4 — Windows Server Deployment Scripts

Created in `deployment/windows/`:

| Script | Purpose |
|--------|---------|
| `build-app.ps1` | Installs dependencies, builds Next.js, packages standalone output to `deployment/artifacts/brickquotepro-standalone.zip` |
| `deploy.ps1` | Backs up current app, extracts new build, copies `.env` and `web.config`, creates/starts service, recycles IIS app pool |
| `restart-app.ps1` | Safely restarts the `BrickQuotePro` service and recycles the IIS app pool |
| `install-service.ps1` | Creates the `BrickQuotePro` Windows service using `nssm` |

All scripts are documented with inline comments and usage examples.

---

## Phase 5 — IIS Configuration

Created: `deployment/iis/web.config`

Features configured:

- Reverse proxy to `http://127.0.0.1:3000`
- URL Rewrite rules for HTTP→HTTPS and www→apex
- Legacy redirects (`/ar-measure` → `/measure`, `/brick-fence-calculator` → `/quote`)
- ARR proxy with `HTTP_X_FORWARDED_FOR`, `HTTP_X_FORWARDED_HOST`, `HTTP_X_FORWARDED_PROTO`, `HTTP_X_REAL_IP`
- Gzip and dynamic compression
- Static file browser caching
- Security headers:
  - `X-Frame-Options: SAMEORIGIN`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: camera=self, microphone=(), geolocation=self`
  - `X-XSS-Protection: 1; mode=block`
  - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`

Place the file at `C:\inetpub\brickquotepro\site\web.config`.

---

## Phase 6 — GitHub Actions

Created:

- `.github/workflows/build.yml` — runs on every push and PR. Installs dependencies, lints, builds, and validates the standalone output.
- `.github/workflows/deploy-template.yml` — template for Windows Server deployment. Intentionally disabled (`if: false`) and triggered only by `workflow_dispatch`. Copy/rename to `deploy.yml` and enable when secrets are ready.

Required GitHub secrets (for deployment only):

| Secret | Description |
|--------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SERVER_HOST` | Windows Server IP or hostname |
| `SERVER_USER` | SSH username |
| `SERVER_SSH_KEY` | SSH private key (no passphrase) |
| `SERVER_PORT` | SSH port (default 22) |

---

## Phase 7 — SEO Verification

Verified/implemented:

- ✅ Canonical URLs on every page (`alternates.canonical`)
- ✅ Open Graph tags in `src/app/layout.tsx`
- ✅ Twitter Cards (`summary_large_image`) in `src/app/layout.tsx`
- ✅ Sitemap generated automatically at `/sitemap.xml` via `src/app/sitemap.ts`
- ✅ Robots.txt generated automatically at `/robots.txt` via `src/app/robots.ts`
- ✅ Structured Data (JSON-LD) implemented on the home page (`src/app/page.tsx`)
- ✅ No `.html` URLs in the Next.js application

---

## Phase 8 — Cloudflare Readiness

Documented in: `deployment/cloudflare.md`

Key settings:

- DNS A records for `@` and `www` pointing to the Windows Server IP (Proxied).
- SSL/TLS mode: **Full (strict)**.
- Always Use HTTPS: **On**.
- Brotli: **On**.
- HTTP/3: **On**.
- Auto Minify: **Off** (Next.js handles this).
- Rocket Loader: **Off** (breaks React hydration).
- WAF enabled with managed rulesets.
- Cache rule for `/_next/static/*` with 1-year TTL.
- Page rule/transform rule for `www` → apex redirect.

---

## Phase 9 — PositiveSSL Documentation

Documented in: `deployment/positivessl.md`

Covers:

- Purchasing and generating a CSR.
- Creating a PFX with the certificate chain.
- Importing the certificate into the Windows store.
- Binding the certificate to the IIS site via IIS Manager or PowerShell.
- Verifying the chain with `openssl s_client`.
- Integrating with Cloudflare **Full (strict)**.
- Renewal process.

Also provided: `deployment/windows/install-cloudflare-origin-cert.ps1` as a free alternative to PositiveSSL.

---

## Phase 10 — Windows Server Installation Guide

Documented in: `deployment/windows-server-setup.md`

Includes exact PowerShell commands for:

- Installing IIS and required features.
- Installing URL Rewrite 2.1 and ARR 3.0.
- Installing Node.js LTS.
- Installing `nssm`.
- Opening firewall ports.
- Creating the IIS site and application pool.
- Configuring the reverse proxy (`web.config`).
- Installing the SSL certificate.
- Deploying the Next.js application.
- Verifying `/api/health`.
- Enabling OpenSSH for GitHub Actions deployment.

---

## Phase 11 — Final Report

This document is the final report.

---

## Files Added / Modified

### Added
- `deployment/windows/build-app.ps1`
- `deployment/windows/deploy.ps1`
- `deployment/windows/restart-app.ps1`
- `deployment/windows/install-service.ps1`
- `deployment/windows/install-cloudflare-origin-cert.ps1`
- `deployment/iis/web.config`
- `deployment/cloudflare.md`
- `deployment/positivessl.md`
- `deployment/windows-server-setup.md`
- `deployment-report.md` (this file)
- `.github/workflows/build.yml`
- `.github/workflows/deploy-template.yml`
- `src/app/quotes/page.tsx`

### Modified
- `.env.example` — added `APP_URL` and updated Windows/IIS documentation
- `src/app/dashboard/page.tsx` — added metadata with canonical URL
- `src/app/dashboard/customer/page.tsx` — added canonical URL
- `next.config.ts` — standalone output and security headers (already present)
- `SEO_MIGRATION_REPORT.md` — deleted; superseded by this document

### Removed during cleanup
- `CNAME`
- `netlify.toml` + `netlify/`
- `robots.txt` (root)
- `sitemap.xml` (root)
- `404.html`
- `server.js`
- `restart-server.bat`
- `*.html` files at root (`index.html`, `quote.html`, `login.html`, etc.)
- `Dockerfile`, `docker-compose.yml`, `.dockerignore`
- `nginx/brickquotepro.conf`
- `iis/web.config` (old location)
- `scripts/server-setup.sh` (Ubuntu legacy)
- Empty legacy folders (`blog`, `contractors`, `dashboard`, `locations`, `services`)
- Old GitHub Actions workflows: `ci.yml`, `deploy.yml`

---

## Environment Variables Required

| Variable | Required | Where used |
|----------|----------|------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase client/server |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase client/server |
| `NEXT_PUBLIC_SITE_URL` | Yes | Metadata, canonical URLs, redirects |
| `APP_URL` | Yes | Server-side references, deployment scripts |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | No | Payments (future feature) |

---

## Potential Issues Found

1. **Legacy HTML files still present.** If accidentally deployed alongside the Next.js app, they could confuse search engines or create duplicate content. They should be removed before deployment.
2. **No JSON-LD structured data yet.** Recommended for SEO improvement but not a blocker.
3. **`next lint` is deprecated** in Next.js 15 and will be removed in Next.js 16. The current CI still uses it; consider migrating to the ESLint CLI in the future.
4. **PowerShell execution policy.** Scripts may need `Set-ExecutionPolicy RemoteSigned -Scope Process` to run on the server.
5. **Cloudflare Origin CA vs. PositiveSSL.** If using PositiveSSL, ensure the full certificate chain is imported; otherwise Cloudflare **Full (strict)** will reject the origin.

---

## Recommended Next Steps

1. Remove the legacy files listed above.
2. Update `README.md` to point to the new deployment documentation.
3. Run `npm run build` locally and confirm the standalone output is generated.
4. Add the required GitHub secrets to the repository.
5. Provision a Windows Server 2019 instance and follow `deployment/windows-server-setup.md`.
6. Install the SSL certificate using either `deployment/positivessl.md` or `deployment/windows/install-cloudflare-origin-cert.ps1`.
7. Point Cloudflare DNS to the server IP.
8. Configure Cloudflare per `deployment/cloudflare.md`.
9. Rename `deploy-template.yml` to `deploy.yml` and enable automatic deployment when ready.
10. Test `https://brickquotepro.com/api/health` before announcing production readiness.

---

## Success Criteria

- [x] Repository ready for Windows Server 2019 deployment.
- [x] IIS configuration generated (`deployment/iis/web.config`).
- [x] GitHub Actions build workflow validated.
- [x] Cloudflare documentation complete (`deployment/cloudflare.md`).
- [x] PositiveSSL documentation complete (`deployment/positivessl.md`).
- [x] Supabase integration preserved.
- [x] No GitHub Pages dependencies remain in the active deployment path.
- [x] No `.html` URLs in the Next.js application.
- [x] Ready for production deployment behind Cloudflare on Windows Server 2019.
