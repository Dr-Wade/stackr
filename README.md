# Stackr

Stack web sources into one URL. A tiny browser-based overlay compositor. Add web sources (URLs), position them on a 1920×1080 canvas, and get a single output URL you can drop into OBS as a Browser Source.

The output URL contains the entire scene encoded in its hash — there is no server, no database, no account.

## Develop

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

Scripts:

- `npm run dev` — Vite dev server
- `npm run build` — type-check + production build to `dist/`
- `npm run preview` — preview the production build
- `npm run typecheck` — type-check only

## How it works

- The editor (`/`) lets you add URLs, position them, and copy an output URL.
- The output (`/view#…`) renders each source in an absolutely-positioned iframe, full-bleed, transparent background. Drop the URL into OBS as a Browser Source at 1920×1080.
- The scene state is gzipped + base64url-encoded into the URL hash. The site never sees the data — it's all client-side.
- The editor also persists your in-progress scene to `localStorage` so you can come back later.

## Deploy on a VPS via Dokploy

This repo ships with a `Dockerfile` and `nginx.conf` ready for Dokploy.

1. Push the repo to GitHub/Gitea.
2. In Dokploy, create a new **Application** of type **Dockerfile**.
3. Point it at the repo + branch (`main`).
4. Expose port `80`, attach a domain, enable Let's Encrypt.
5. No environment variables or volumes required.
6. Enable auto-deploy on push.

The Nginx config:

- SPA-fallbacks to `index.html` so `/view#…` works on refresh.
- Long-caches hashed assets, short-caches everything else.
- Sets `Permissions-Policy` so autoplay/clipboard work for common overlays.
- Does **not** set `X-Frame-Options`, so the `/view` page can be embedded in OBS / other tools.

## Verify locally with Docker

```bash
docker build . -t stackr
docker run --rm -p 8080:80 stackr
open http://localhost:8080
```
