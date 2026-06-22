# BrickQuote Pro — Next.js Migration & Production Setup Report

**Generated:** June 2026  
**Stack:** Next.js 15 (App Router) · React 19 · TypeScript · Supabase · Docker · Nginx · GitHub Actions  
**Target:** Ubuntu dedicated server behind Cloudflare CDN

---

## Phase Summary

| Phase | Status | Description |
|-------|--------|-------------|
| 1 — Audit | ✅ Complete | Legacy stack analysed, conflicts identified |
| 2 — Next.js Migration | ✅ Complete | Full app scaffold with all routes and components |
| 3 — Environment Config | ✅ Complete | `.env.example` with documented vars |
| 4 — Dockerization | ✅ Complete | Multi-stage Dockerfile + `docker-compose.yml` |
| 5 — Nginx Config | ✅ Complete | HTTPS, rate limiting, static caching |
| 6 — GitHub Actions CI/CD | ✅ Complete | CI lint/build + CD deploy via SSH |
| 7 — SEO & Production Readiness | ✅ Complete | Sitemap, robots, metadata, canonical URLs |
| 8 — Cloudflare Documentation | ✅ Complete (see below) |
| 9 — Server Deployment | ✅ Complete | `scripts/server-setup.sh` |
| 10 — Final Report | ✅ This document |

---

## Files Created

### App Structure (`src/`)
| File | Purpose |
|------|---------|
| `src/app/layout.tsx` | Root layout — SEO metadata, Inter font, global CSS |
| `src/app/globals.css` | Global styles ported from legacy `assets/css/style.css` |
| `src/app/page.tsx` | Home page — hero, project types, how-it-works, CTA |
| `src/app/quote/page.tsx` | Calculator page |
| `src/app/login/page.tsx` | Login page (no-index) |
| `src/app/signup/page.tsx` | Signup page (no-index) |
| `src/app/measure/page.tsx` | AR Measure tool page |
| `src/app/dashboard/page.tsx` | Role-based dashboard redirect |
| `src/app/dashboard/customer/page.tsx` | Customer dashboard (SSR, protected) |
| `src/app/auth/callback/route.ts` | Supabase OAuth callback handler |
| `src/app/api/health/route.ts` | Health check endpoint (`/api/health`) |
| `src/app/not-found.tsx` | Global 404 page |
| `src/app/sitemap.ts` | Dynamic XML sitemap (25 URLs) |
| `src/app/robots.ts` | `robots.txt` with blocked auth paths |

### Components (`src/components/`)
| File | Purpose |
|------|---------|
| `Header.tsx` | Responsive nav with active-state links |
| `Footer.tsx` | Links grid — services, locations, resources |
| `QuoteCalculator.tsx` | Full interactive quote calculator (client component) |
| `LoginForm.tsx` | Auth form with Suspense boundary |
| `SignupForm.tsx` | Registration with role selection |
| `CustomerDashboard.tsx` | Quotes & leads table |
| `ARMeasureClient.tsx` | AR tool shell (loads legacy JS via `next/script`) |

### Libraries (`src/lib/`)
| File | Purpose |
|------|---------|
| `supabase/client.ts` | Browser Supabase client (`@supabase/ssr`) |
| `supabase/server.ts` | Server Supabase client with async cookie handling |
| `pricing.ts` | Full TypeScript pricing engine (ported from legacy `calculator.js`) |
| `middleware.ts` | Route protection + auth redirects |

### Infrastructure
| File | Purpose |
|------|---------|
| `Dockerfile` | 3-stage build: deps → builder → runner (non-root user) |
| `docker-compose.yml` | Single-service compose with healthcheck |
| `.dockerignore` | Excludes legacy HTML, `.env`, build artefacts |
| `.env.example` | Documented environment variable template |
| `nginx/brickquotepro.conf` | Full Nginx config: HTTPS, TLS 1.3, gzip, caching, rate limits |
| `.github/workflows/ci.yml` | CI: lint → build → docker build (no push) |
| `.github/workflows/deploy.yml` | CD: build → push GHCR → SSH deploy |
| `scripts/server-setup.sh` | Ubuntu 22.04 initial setup (Docker, Nginx, UFW, Certbot) |
| `next.config.ts` | standalone output, security headers, redirects |
| `tsconfig.json` | Strict TypeScript with `@/` path aliases |
| `.eslintrc.json` | Next.js core-web-vitals ruleset |
| `.gitignore` | Updated with Next.js build artefacts |

---

## Build Verification

```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages (13/13)
✓ Finalizing page optimization

Route (app)                  Size    First Load JS
○ /                          661 B   107 kB
○ /login                     1.4 kB  173 kB
○ /quote                     5.07 kB 111 kB
ƒ /dashboard                 137 B   103 kB
ƒ /dashboard/customer        1.3 kB  107 kB
ƒ /api/health                137 B   103 kB
○ /sitemap.xml               137 B   103 kB
○ /robots.txt                137 B   103 kB
```

---

## Environment Variables Required

| Variable | Where to find |
|----------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SITE_URL` | Your domain: `https://brickquotepro.com` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe Dashboard → API Keys (optional) |

Copy `.env.example` → `.env.local` for development.

---

## Cloudflare Setup Guide (Phase 8)

### DNS
1. Add **A record**: `brickquotepro.com` → server IP, **Proxied** (orange cloud)
2. Add **A record**: `www` → server IP, **Proxied**

### Page Rules / Transform Rules
- `www.brickquotepro.com/*` → Redirect 301 → `https://brickquotepro.com/$1`

### SSL/TLS
- Mode: **Full (strict)** — Cloudflare ↔ origin is encrypted with your Let's Encrypt cert
- Always Use HTTPS: **On**
- Minimum TLS Version: **TLS 1.2**
- HSTS: **Enabled** (max-age 6 months, include subdomains)

### Caching
- Cache Level: **Standard**
- Browser Cache TTL: **4 hours**
- Cache Rules: Cache `/_next/static/*` with **Cache Everything**, TTL 1 year

### Security
- Bot Fight Mode: **On**
- Security Level: **Medium**
- Challenge Passage: **30 minutes**
- WAF: Enable OWASP Core Ruleset (paranoia level 1)

### Performance
- Rocket Loader: **Off** (conflicts with Next.js hydration)
- Auto Minify: **Off** (Next.js already minifies)
- HTTP/2: **On**
- HTTP/3 (QUIC): **On**

---

## Server Deployment Steps (Phase 9)

```bash
# 1. Run initial setup (once on fresh Ubuntu 22.04)
sudo bash scripts/server-setup.sh

# 2. Set environment variables
cp .env.example /opt/brickquotepro/.env
nano /opt/brickquotepro/.env   # fill in real values

# 3. Copy compose file
cp docker-compose.yml /opt/brickquotepro/

# 4. Start the app
cd /opt/brickquotepro
docker compose up -d

# 5. Configure Nginx
cp nginx/brickquotepro.conf /etc/nginx/sites-available/brickquotepro.com
ln -s /etc/nginx/sites-available/brickquotepro.com \
      /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

# 6. Issue SSL certificate (after DNS is live)
certbot --nginx -d brickquotepro.com -d www.brickquotepro.com

# 7. Verify
curl https://brickquotepro.com/api/health
```

---

## GitHub Actions Secrets Required

| Secret | Value |
|--------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SERVER_HOST` | Server IP or hostname |
| `SERVER_USER` | SSH user (e.g. `brickquote`) |
| `SERVER_SSH_KEY` | Private SSH key (no passphrase) |
| `SERVER_PORT` | SSH port (default: 22) |

---

## SEO Configuration

- **Canonical URLs**: Set per-page via `alternates.canonical` in Next.js metadata
- **Sitemap**: Auto-generated at `/sitemap.xml` with 25 URLs and priority scores
- **robots.txt**: Auto-generated at `/robots.txt`, blocking `/dashboard/`, `/account/`, `/admin/`, `/api/`
- **Open Graph**: Title, description, image set in root `layout.tsx`
- **Twitter Cards**: `summary_large_image` configured
- **Structured Data**: To be added in Phase 7 follow-up
- **301 Redirects**: `/ar-measure` → `/measure`, `/brick-fence-calculator` → `/quote`

---

## Security Notes

- All secrets are environment variables — never in source code
- Docker container runs as non-root user (`nextjs`, uid 1001)
- Nginx rate limits: 20 req/s for `/api/`, 50 req/s general
- HTTP → HTTPS redirect at Nginx level
- HSTS with 1-year max-age
- Cloudflare WAF as first line of defence
- `NEXT_PUBLIC_*` vars are build-time only (safe to embed in client bundle)

---

## Next Steps

1. `npm run dev` — local development
2. Create `.env.local` from `.env.example`
3. Run server setup script on Ubuntu host
4. Add GitHub Actions secrets
5. Push to `master` branch to trigger CI/CD
6. Point Cloudflare DNS to server IP
7. Issue Let's Encrypt certificate via Certbot
