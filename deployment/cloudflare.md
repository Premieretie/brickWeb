# Cloudflare Configuration for brickquotepro.com

This document describes how to configure Cloudflare for the Brick Quote Pro Next.js application hosted on Windows Server 2019 + IIS + ARR.

---

## 1. DNS Setup

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com).
2. Select the `brickquotepro.com` domain.
3. Go to **DNS** → **Records**.
4. Add the following A records:

| Type | Name | IPv4 address | Proxy status | TTL |
|------|------|--------------|--------------|-----|
| A | `@` | `YOUR_SERVER_IP` | Proxied | Auto |
| A | `www` | `YOUR_SERVER_IP` | Proxied | Auto |

5. Remove any legacy GitHub Pages or Netlify DNS records (CNAME for `www`, AAAA records, etc.).

---

## 2. SSL/TLS Setup

Go to **SSL/TLS** → **Overview**.

| Setting | Value | Notes |
|---------|-------|-------|
| Encryption mode | **Full (strict)** | Requires a valid certificate on the IIS origin (PositiveSSL, Cloudflare Origin CA, or any Windows-trusted cert). |
| Always Use HTTPS | **On** | Redirects all HTTP to HTTPS at the edge. |
| Automatic HTTPS Rewrites | **On** | Rewrites HTTP links in HTML to HTTPS. |
| Minimum TLS Version | **TLS 1.2** | Blocks older clients. |
| HSTS | **Enabled** | max-age: 6 months, Include subdomains: On, Preload: On. |

---

## 3. Caching

Go to **Caching** → **Configuration**.

| Setting | Value |
|---------|-------|
| Caching Level | Standard |
| Browser Cache TTL | 4 hours |
| Edge Cache TTL | Respect origin headers |
| Always Online | Off (Next.js is dynamic; use with caution) |

### Cache Rules (recommended)

Create a Cache Rule for Next.js static assets:

- **When matching:** URL path contains `/_next/static/`
- **Then:** Cache Eligibility = Eligible for cache, Edge TTL = 1 year, Browser TTL = 1 year

This offloads static JS/CSS to Cloudflare's edge and reduces origin load.

---

## 4. Web Application Firewall (WAF)

Go to **Security** → **WAF**.

Enable the following managed rulesets:

- Cloudflare Managed Ruleset: **On** (Medium sensitivity)
- OWASP Core Ruleset: **On** (Paranoia level 1)
- Bot Fight Mode: **On**
- Security Level: **Medium**
- Challenge Passage: **30 minutes**

### Recommended rate limiting rules

- **General traffic:** 100 requests per 10 seconds per IP
- **API routes:** 50 requests per 10 seconds per IP for `/api/*`
- **Login/signup:** 10 requests per minute per IP for `/login`, `/signup`, `/auth/*`

---

## 5. Performance Settings

Go to **Speed** → **Optimization**.

| Setting | Value | Notes |
|---------|-------|-------|
| Brotli | **On** | Better compression than gzip for compatible browsers. |
| Auto Minify | **Off** for JS, CSS, HTML | Next.js already minifies; enabling this can break scripts. |
| Rocket Loader | **Off** | Conflicts with Next.js hydration and React. |
| HTTP/2 | **On** | Default. |
| HTTP/3 (QUIC) | **On** | Improves performance on mobile networks. |
| 0-RTT Connection Resumption | **On** | Faster TLS handshakes. |
| Early Hints | **On** | Sends 103 Early Hints for static assets. |

---

## 6. Page Rules / Transform Rules

### Redirect www to apex

Create a **Transform Rule** → **Rewrite URL** or a **Page Rule**:

- **If:** Hostname equals `www.brickquotepro.com`
- **Then:** Static 301 redirect to `https://brickquotepro.com/$1`

### Cache static assets (Page Rule alternative)

If using legacy Page Rules:

- **URL pattern:** `*brickquotepro.com/_next/static/*`
- **Settings:** Cache Level = Cache Everything, Edge Cache TTL = 1 month

---

## 7. Scrape Shield / Bots

Go to **Security** → **Bots**.

- Bot Fight Mode: **On**
- Super Bot Fight Mode: Optional (may block some legitimate API clients; monitor first)

---

## 8. Origin Certificates (optional)

If you do not want to purchase a certificate, use Cloudflare Origin CA:

1. **SSL/TLS** → **Origin Server** → **Create Certificate**.
2. Choose **RSA (2048)** and **15 years**.
3. Save the certificate and key files.
4. Run the helper script on the Windows Server:

```powershell
.\deployment\windows\install-cloudflare-origin-cert.ps1 `
  -CertPath C:\certs\cloudflare-origin.pem `
  -KeyPath C:\certs\cloudflare-origin.key
```

This keeps the origin certificate free and trusted by Cloudflare under **Full (strict)**.

---

## 9. Summary Checklist

- [ ] DNS A records for `@` and `www` point to the Windows Server IP and are Proxied.
- [ ] SSL/TLS mode is **Full (strict)**.
- [ ] Always Use HTTPS is **On**.
- [ ] HSTS is enabled.
- [ ] WAF managed rulesets are enabled.
- [ ] Rate limiting rules are configured.
- [ ] Brotli and HTTP/3 are enabled.
- [ ] Rocket Loader and Auto Minify are **Off**.
- [ ] Cache rule for `/_next/static/*` is configured.
- [ ] `www` → apex redirect is configured.
