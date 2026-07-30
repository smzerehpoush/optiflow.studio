# Optiflow Studio — Website

Dark, kinetic, futuristic landing page for Optiflow: an AI studio building
products that solve real problems.

**Live:** https://optiflow.studio — self-hosted (Caddy reverse proxy on the
same VPS as other projects), behind ArvanCloud CDN.

## Stack

Zero dependencies. Pure HTML + CSS + vanilla JS. Fonts from Google Fonts
(Unbounded / Space Grotesk / Inter / JetBrains Mono).

- `index.html` — markup (flagship "Neural Core" design)
- `style.css` — design system + all styling
- `main.js` — 3D neural-core canvas + flow trails, custom cursor, decode
  text effects, scroll reveals, manifesto scrub, counters, magnetic buttons,
  card tilt/spotlight, terminal typing, glitch, HUD (progress/rail/readouts),
  nav behavior, mobile menu

## Run locally

```bash
python3 -m http.server 4173
# → http://localhost:4173
```

(Or just open `index.html` directly — no build step.)

## Deploy

It's a static site — drop `index.html`, `style.css`, `main.js` on any host.

For the current production server:

```bash
cp .env.deploy.example .env.deploy   # once, then fill in your host
./deploy.sh                          # rsyncs the three files and verifies HTTP 200
```

`.env.deploy` is gitignored on purpose — real hosts/paths never get committed
to this (public) repo. `deploy.sh` reads `DEPLOY_HOST` (required),
`DEPLOY_PATH` (default `/srv/optiflow-studio/`), and `SITE_URL` (default
`https://optiflow.studio/`) from it.

## Notes

- Only one real case study (`Padelyar`) exists in `#work` so far — the
  second card is an honest "your project here" CTA, not a placeholder.
- Social links in the footer are `href="#"` stubs.
- Contact email is `hello@optiflow.studio` (hero CTA + contact section).
- `prefers-reduced-motion` is respected: canvas, glitch, marquee and scroll
  effects all switch off.
