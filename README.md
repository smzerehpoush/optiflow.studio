# Optiflow Studio — Website

Dark, kinetic, futuristic landing page for Optiflow: an AI studio building
products that solve real problems.

**Live:** https://optiflow.studio (custom domain via GitHub Pages;
https://smzerehpoush.github.io/optiflow.studio/ also resolves to the same
site while DNS propagates)

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

It's a static site: drop the three files on any host (Vercel, Netlify,
Cloudflare Pages, GitHub Pages, an S3 bucket…).

## Notes

- The three case studies in `#work` are **sample placeholders** — swap in
  real projects.
- Social links in the footer are `href="#"` stubs.
- Contact email is `hello@optiflow.studio` (hero CTA + contact section).
- `prefers-reduced-motion` is respected: canvas, glitch, marquee and scroll
  effects all switch off.
