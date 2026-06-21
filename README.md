# BrickQuote Pro - Brick Fence & Wall Quote Calculator

A professional brick wall, fence, and mailbox quote calculator with Supabase authentication, saved quotes, lead capture, contractor directory, and admin dashboards.

## Features

- **6 Project Types**: Brick Fence, Brick Wall, Front Fence, Retaining Wall, Mailbox, Mailbox + Fence
- **5 Layout Options**: Straight, L-Shape, U-Shape, Front with Returns, Front with Mailbox
- **6 Brick Styles**: Standard Red, Face Brick, Smooth Face, Rendered, Feature, Custom
- **4 Column Sizes**: None, 230mm, 350mm, 450mm
- **4 Mailbox Types**: None, Standard, Pillar, Large Parcel Box
- **Live SVG Visualizer**: Real-time preview as you configure
- **Instant Pricing**: Wall area + columns + mailbox calculations
- **Mobile Responsive**: Works on all devices
- **Shareable URLs**: Save and share quote configurations
- **PDF Export**: Print or download quotes
- **Lead Form**: Formspree/EmailJS integration ready

## Live Demo

[View Live Demo](https://yourusername.github.io/brickquote-pro)

## GitHub Pages Deployment

### Method 1: Direct Upload

1. Create a new repository on GitHub
2. Upload all files from this project
3. Go to Settings → Pages
4. Select "Deploy from a branch"
5. Choose "main" branch and "/ (root)" folder
6. Click Save
7. Your site will be live at `https://yourusername.github.io/repository-name`

### Method 2: Git Command Line

```bash
# Clone your repository
git clone https://github.com/yourusername/brickquote-pro.git
cd brickquote-pro

# Copy all project files to this directory
# Then commit and push
git add .
git commit -m "Initial commit - BrickQuote Pro"
git push origin main
```

### Method 3: GitHub Desktop

1. Create a new repository on GitHub
2. Open GitHub Desktop and clone the repository
3. Copy all project files to the local folder
4. Commit with message "Initial commit"
5. Push to origin

## Setup Lead Form (Formspree)

1. Go to [Formspree](https://formspree.io) and create a free account
2. Create a new form
3. Copy your form endpoint URL (e.g., `https://formspree.io/f/YOUR_FORM_ID`)
4. Open `quote.html` and replace `YOUR_FORM_ID` in the form action:

```html
<form id="contact-form" action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
```

## File Structure

```
brickWeb/
├── index.html              # Landing page
├── quote.html              # Main calculator
├── README.md               # This file
├── assets/
│   ├── css/
│   │   ├── style.css       # Main stylesheet
│   │   └── calculator.css    # Calculator styles
│   └── js/
│       ├── app.js          # Landing page logic
│       ├── config.js       # Configuration data
│       ├── pricing.js      # Pricing engine
│       ├── renderer.js     # SVG visualizer
│       └── calculator.js   # Calculator logic
└── data/
    └── products.json       # Product data
```

## Customization

### Update Pricing

Edit `assets/js/config.js` to modify pricing:

```javascript
bricks: [
    { id: 'standard-red', name: 'Standard Red', priceMin: 180, priceMax: 220, ... },
    // Add or modify bricks
]
```

### Add New Brick Styles

1. Add to `BRICKQUOTE_CONFIG.bricks` in `config.js`
2. Add color/style to `getBrickStyle()` in `renderer.js`

### Change Colors

Edit CSS variables in `style.css`:

```css
:root {
    --primary: #C75B39;      /* Main brand color */
    --secondary: #2C3E50;    /* Dark sections */
    --accent: #E8A87C;       /* Highlights */
}
```

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+
- iOS Safari 13+
- Chrome Android 80+

## Performance

- No external dependencies (except Google Fonts)
- SVG-based rendering (lightweight)
- All calculations client-side
- Lazy loading of sections
- Optimized for mobile networks

## Supabase Setup & Deployment

### 1. Environment variables

Copy `.env.example` to `.env` and fill in your Supabase project values:

```bash
cp .env.example .env
```

Required variables:

```text
SUPABASE_URL
SUPABASE_PUBLISHABLE_KEY
SUPABASE_SECRET_KEY
SUPABASE_JWKS_URL
```

Optional (subscription foundations):

```text
STRIPE_PUBLISHABLE_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
```

**Never commit `.env` to Git.** It is already listed in `.gitignore`.

### 2. Database migration

Run `supabase/migrations/001_init.sql` in the Supabase SQL Editor or via the Supabase CLI:

```bash
supabase db reset
# or copy the SQL into the Supabase Dashboard SQL Editor
```

This creates:

- `profiles` (users & roles)
- `contractors` (business profiles)
- `quotes` (saved quotes)
- `leads` (customer enquiries)
- `subscriptions` (Stripe foundation)
- `service_areas` & `gallery_images`
- Row Level Security policies
- Storage buckets: `contractor-logos`, `contractor-gallery`

### 3. Promote an admin

After signing up, run this SQL to promote a user to admin:

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'your@email.com';
```

### 4. Run locally

```bash
npm install
npm start
```

Open `http://127.0.0.1:8090`.

### 5. Production deployment

Deploy to any Node.js host (Render, Railway, Fly.io, VPS, etc.):

```bash
npm install
npm start
```

Set the environment variables on the host and ensure the server exposes port `80` or the host's required port.

**Important:** The publishable Supabase key is safe to expose to the browser. The service role key (`SUPABASE_SECRET_KEY`) must stay server-side and is only used for future Stripe webhooks or admin endpoints.

### 6. GitHub Pages / static hosting

The site is pure static HTML/JS, so it can also be deployed to GitHub Pages or any static host without `server.js`.

1. Open `config.js` in the project root.
2. Replace the empty values with your public keys:
   - `SUPABASE_URL`
   - `SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_JWKS_URL` (optional, used for JWT verification)
   - `STRIPE_PUBLISHABLE_KEY` (optional, for future subscriptions)
3. Commit and push the site files to your host.
4. In Supabase Auth → URL configuration, add your deployed domain (e.g. `https://yourusername.github.io/brickquote-pro`).
5. If your site is deployed to a subpath (e.g. `https://yourusername.github.io/repo-name/`), either use a custom domain or update the root-relative paths (`/config.js`, `/login`, `/assets/...`) to include the subpath.

### 7. Authentication pages

- `/login`
- `/signup`
- `/forgot-password`
- `/reset-password`
- `/account`

### 8. Dashboards

- `/dashboard/customer`
- `/dashboard/contractor`
- `/dashboard/admin`

### 9. Contractor marketplace

- `/contractors`
- `/contractors/:slug`

## License

MIT License - feel free to use for commercial projects.

## Support

For questions or custom development:
- Open an issue on GitHub
- Email: your-email@example.com

---

Built with HTML, CSS, and vanilla JavaScript. No frameworks required.
