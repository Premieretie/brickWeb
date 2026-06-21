const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8090;

// Never cache responses — critical for config.js and auth pages during development.
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    next();
});

// Expose only the publishable Supabase config to the browser.
// The secret key and any other server-side secrets stay server-side.
app.get('/config.js', cors(), (req, res) => {
    res.set('Content-Type', 'application/javascript');
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    res.send(`window.ENV = {
  SUPABASE_URL: ${JSON.stringify(process.env.SUPABASE_URL || '')},
  SUPABASE_PUBLISHABLE_KEY: ${JSON.stringify(process.env.SUPABASE_PUBLISHABLE_KEY || '')},
  SUPABASE_JWKS_URL: ${JSON.stringify(process.env.SUPABASE_JWKS_URL || '')},
  STRIPE_PUBLISHABLE_KEY: ${JSON.stringify(process.env.STRIPE_PUBLISHABLE_KEY || '')}
};`);
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ ok: true, time: new Date().toISOString() });
});

// Dynamic contractor profile pages
app.get('/contractors/:slug', (req, res) => {
    res.sendFile(path.join(__dirname, 'contractors', 'profile.html'));
});

// Serve static files
app.use(express.static(path.join(__dirname), {
    // Do not cache config.js
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('config.js')) {
            res.set('Cache-Control', 'no-store');
        }
    }
}));

// Clean URL fallback: /login -> /login/index.html, /dashboard/customer -> /dashboard/customer.html
const fs = require('fs');
app.use((req, res, next) => {
    if (req.method !== 'GET' || req.path.includes('.')) return next();
    // Prefer folder/index.html for clean URLs
    const indexPath = path.join(__dirname, req.path, 'index.html');
    if (fs.existsSync(indexPath)) return res.sendFile(indexPath);
    // Fall back to legacy .html for redirects
    const htmlPath = path.join(__dirname, req.path + '.html');
    if (fs.existsSync(htmlPath)) return res.sendFile(htmlPath);
    next();
});

app.listen(PORT, () => {
    console.log(`BrickQuote Pro server running at http://127.0.0.1:${PORT}`);
});
