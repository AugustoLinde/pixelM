# Demo Store — E-Commerce with Meta Pixel

Minimal e-commerce scaffold with Meta Pixel (ID: 45202529883535) pre-integrated.

## Pixel Events Implemented

| Page | Event | Trigger |
|------|-------|---------|
| All pages | PageView | Automatic (base pixel code) |
| index.html | ViewContent | Product card clicked |
| index.html | AddToCart | "Add to Cart" button |
| checkout.html | InitiateCheckout | Page load |
| thank-you.html | Purchase | Page load (value + currency) |

## Security Note

- **Pixel ID** (45202529883535): This is a PUBLIC client-side identifier, safe in HTML source (same as any website using Meta Pixel).
- **Conversions API Token**: This is SECRET. Store it as an environment variable (`META_CAPI_TOKEN`) on your server host (Render). Never commit it to GitHub.

## Quick Start

### Frontend (static)
```bash
npx serve .
# or: python3 -m http.server 8080
```

### Backend
```bash
cd server
npm install
npm start   # http://localhost:3000
```

## Deploy

### Frontend → GitHub Pages
1. Push repo (exclude `server/` or keep it — Pages only serves static files)
2. Settings → Pages → main branch, root `/`
3. Set `window.DEMO_SERVER_URL` in `js/app.js` to your Render URL

### Backend → Render
1. New Web Service → root directory: `server/`
2. Build: `npm install` | Start: `npm start`
3. Add env var: `META_CAPI_TOKEN=your_secret_token` (for future CAPI integration)
