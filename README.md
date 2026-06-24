# BrickQuote Pro — Brick Fence & Wall Quote Marketplace

A production-ready Next.js 15 application that connects Brisbane homeowners with licensed bricklaying contractors. Features an instant quote calculator, contractor marketplace, lead generation, admin/contractor dashboards, and Stripe subscription billing.

Built for deployment on **Windows Server 2019** behind **IIS + ARR**, with **Cloudflare** in front and **Supabase** for auth and data.

**Target architecture:**

```
Cloudflare → Windows Server 2019 → IIS + ARR → Next.js → Supabase
```

---

## Tech Stack

- **Next.js 15** (App Router)
- **React 19**
- **TypeScript**
- **Supabase** (`@supabase/ssr`)
- **Stripe** (subscription billing)
- **Windows Server 2019** + **IIS** + **ARR** + **URL Rewrite**
- **Cloudflare** (DNS, SSL, WAF, CDN)

---

## Marketplace Features

- **Quote calculator** — instant estimates for brick fences, block fences, retaining walls, mailboxes, and piers.
- **Lead capture** — guests and logged-in customers can save quotes and submit project leads.
- **Contractor signup** — `/join` application with admin approval workflow.
- **Contractor directory** — `/contractors` listing approved contractors with profiles, gallery, and reviews.
- **Contractor dashboard** — manage leads, update profile, and manage Stripe subscription.
- **Admin dashboard** — approve/reject contractors, assign leads, manage users, and add notes.
- **SEO pages** — generated service and location pages for Brisbane, Gold Coast, Ipswich, Logan, Moreton Bay, Redlands, and Sunshine Coast.
- **Legal pages** — Terms of Service, Privacy Policy, and Contractor Agreement.

---

## Local Development

1. Install dependencies:

```powershell
npm install --legacy-peer-deps
```

2. Copy environment variables:

```powershell
copy .env.example .env.local
# Edit .env.local with your Supabase credentials
```

3. Run the dev server:

```powershell
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Production Build

```powershell
npm run build
```

The build produces a standalone Next.js output in `.next/standalone` ready to run on Windows Server with Node.js.

---

## Windows Server Deployment

Deployment documentation is organized under `deployment/`:

| Document | Purpose |
|----------|---------|
| `deployment/windows-server-setup.md` | Install IIS, ARR, Node.js, and configure the server |
| `deployment/cloudflare.md` | Cloudflare DNS, SSL, WAF, caching, and performance settings |
| `deployment/positivessl.md` | Install a PositiveSSL certificate on IIS |
| `deployment/windows/build-app.ps1` | Build and package the Next.js app on Windows |
| `deployment/windows/deploy.ps1` | Deploy a build artifact to the server |
| `deployment/windows/restart-app.ps1` | Safely restart the application |
| `deployment/windows/install-service.ps1` | Create the `BrickQuotePro` Windows service |
| `deployment/windows/install-cloudflare-origin-cert.ps1` | Install a free Cloudflare Origin CA certificate |
| `deployment/iis/web.config` | IIS reverse proxy + rewrite rules |
| `deployment-report.md` | Complete deployment report and checklist |

### Quick deployment checklist

1. Provision Windows Server 2019 and follow `deployment/windows-server-setup.md`.
2. Create `C:\inetpub\brickquotepro\.env` from `.env.example`.
3. Install an SSL certificate (PositiveSSL or Cloudflare Origin CA).
4. Point Cloudflare DNS to the server IP.
5. Build the app and run `deployment/windows/deploy.ps1`.
6. Verify `https://brickquotepro.com/api/health`.

---

## GitHub Actions

- `.github/workflows/build.yml` — validates linting and the production build on every push and PR.
- `.github/workflows/deploy-template.yml` — disabled template for Windows Server deployment. Rename to `deploy.yml` and enable when the server is ready.

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key for admin actions |
| `NEXT_PUBLIC_SITE_URL` | Yes | Public site URL (`https://brickquotepro.com`) |
| `APP_URL` | Yes | Internal app URL (matches public URL on this architecture) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | No | Stripe publishable key |
| `STRIPE_SECRET_KEY` | No | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | No | Stripe webhook endpoint secret |
| `STRIPE_PRICE_STARTER` | No | Stripe price ID for the Starter plan |
| `STRIPE_PRICE_PROFESSIONAL` | No | Stripe price ID for the Professional plan |
| `STRIPE_PRICE_PREMIUM` | No | Stripe price ID for the Premium plan |

Never commit real values to git. Use `.env.local` locally and `C:\inetpub\brickquotepro\.env` on the server.

---

## Important Notes

- This project has been migrated from a static HTML/JS site to Next.js. Legacy files have been removed.
- The application is not deployed yet. DNS, Cloudflare, and Supabase data remain unchanged until you manually execute those steps.
- See `deployment-report.md` for the full audit, file list, and next steps.
