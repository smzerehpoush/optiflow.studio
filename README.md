# Optiflow Studio — Website

Dark, kinetic, futuristic landing page for Optiflow: an AI studio building
products that solve real problems.

**Live:** https://smzerehpoush.github.io/optiflow.studio/
**Design lab (partner demos):** https://smzerehpoush.github.io/optiflow.studio/variants/

## Stack

Zero dependencies. Pure HTML + CSS + vanilla JS. Fonts from Google Fonts
(Unbounded / Space Grotesk / Inter / JetBrains Mono).

- `index.html` — markup (flagship "Neural Core" design)
- `style.css` — design system + all styling
- `main.js` — 3D neural-core canvas + flow trails, custom cursor, decode
  text effects, scroll reveals, manifesto scrub, counters, magnetic buttons,
  card tilt/spotlight, terminal typing, glitch, HUD (progress/rail/readouts),
  nav behavior, mobile menu

## Design variants (`variants/`)

Thirteen full design directions over the same content, for partner demos —
`variants/index.html` is the gallery hub.

**Dark series:**
1. **Neural Core** (`../index.html`) — flagship: 3D wireframe sphere, cyan × violet, FUI HUD
2. **Aether Glass** (`aether.html`) — prismatic glassmorphism, luxury-future
3. **Command Deck** (`command.html`) — mission-control terminal FUI
4. **Acid Monolith** (`monolith.html`) — neo-brutalist type walls, acid accent

**Light series:**
5. **Paper Lab** (`paper.html`) — editorial serif on paper, Klein blue, journal annotations
6. **Solar Flare** (`solar.html`) — daylight futurism, sunrise gradient blobs
7. **Blueprint** (`blueprint.html`) — engineering drawing, grid paper, dimension lines
8. **Chrome Pulse** (`chrome.html`) — Y2K liquid metal, silver chrome, holo foil
9. **Duality** (`duality.html`) — minimal luxe with a light/dark theme toggle

**Reference cuts:**
10. **Loom** (`loom.html`) — Son Daven-style expedition: dithered planet preloader,
    barcode mountain landscapes, chapter storytelling, duotone photography
    (placeholder photos via picsum.photos — swap for real product/team shots)
11. **Riso Press** (`riso.html`) — developer risograph (bone × charcoal, dither
    textures; inspired by contentarchitecture.dev)
12. **Convergence** (`convergence.html`) — editorial frame-grid (serif × mono,
    signal orange; inspired by vibecon.ai)
13. **Tiny Theater** (`theater.html`) — emotional white-space theater (floating
    chips, one statement at a time; inspired by tinywins.com)

Each variant is a single self-contained HTML file.

## Run locally

```bash
python3 -m http.server 4173
# → http://localhost:4173
```

(Or just open `index.html` directly — no build step.)

## Deploy

It's a static site: drop the three files on any host (Vercel, Netlify,
Cloudflare Pages, GitHub Pages, an S3 bucket…).

## Notes

- The three case studies in `#work` are **sample placeholders** — swap in
  real projects.
- Social links in the footer are `href="#"` stubs.
- Contact email is `hello@optiflow.studio` (hero CTA + contact section).
- `prefers-reduced-motion` is respected: canvas, glitch, marquee and scroll
  effects all switch off.
