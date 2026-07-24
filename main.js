/* ============================================================
   OPTIFLOW STUDIO — main.js
   Preloader, flow-field canvas, cursor, reveals, manifesto,
   counters, magnetic buttons, tilt, terminal, glitch, nav.
   ============================================================ */

(() => {
  'use strict';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;

  /* ---------- Preloader ---------- */
  const preCount = document.getElementById('preCount');
  const preBar = document.getElementById('preBar');
  const PRELOAD_MS = reduced ? 0 : 1100;

  function runPreloader() {
    if (PRELOAD_MS === 0) {
      document.body.classList.add('loaded');
      return;
    }
    const start = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / PRELOAD_MS, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = Math.round(eased * 100);
      preCount.textContent = String(val).padStart(3, '0');
      preBar.style.width = val + '%';
      if (p < 1) {
        requestAnimationFrame(tick);
      } else {
        setTimeout(() => document.body.classList.add('loaded'), 150);
      }
    }
    requestAnimationFrame(tick);
    // Safety net: if rAF is throttled (hidden/occluded tab), reveal anyway.
    setTimeout(() => document.body.classList.add('loaded'), 2600);
  }
  runPreloader();

  /* ---------- UTC clock ---------- */
  const clock = document.getElementById('utcClock');
  function updateClock() {
    clock.textContent = new Date().toUTCString().slice(17, 25) + ' UTC';
  }
  updateClock();
  setInterval(updateClock, 1000);

  /* ---------- Custom cursor ---------- */
  if (finePointer && !reduced) {
    document.body.classList.add('has-cursor');
    const dot = document.getElementById('cursorDot');
    const ring = document.getElementById('cursorRing');
    let mx = innerWidth / 2, my = innerHeight / 2;
    let rx = mx, ry = my;

    addEventListener('mousemove', (e) => {
      mx = e.clientX;
      my = e.clientY;
      dot.style.transform = `translate(${mx - 3}px, ${my - 3}px)`;
    }, { passive: true });

    (function followRing() {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      ring.style.transform = `translate(${rx - 18}px, ${ry - 18}px)`;
      requestAnimationFrame(followRing);
    })();

    document.addEventListener('mouseover', (e) => {
      if (e.target.closest('a, button, [data-hover]')) ring.classList.add('is-hover');
    });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest('a, button, [data-hover]')) ring.classList.remove('is-hover');
    });
  }

  /* ---------- Flow-field canvas ---------- */
  const canvas = document.getElementById('field');
  if (canvas && !reduced) {
    const ctx = canvas.getContext('2d');
    const hero = document.querySelector('.hero');
    const dpr = Math.min(devicePixelRatio || 1, 2);
    let W = 0, H = 0;
    let particles = [];
    let heroVisible = true;
    let raf = null;
    const mouse = { x: -9999, y: -9999 };

    const COLORS = [
      'rgba(0, 229, 255, 0.55)',
      'rgba(0, 229, 255, 0.35)',
      'rgba(124, 92, 255, 0.5)',
      'rgba(124, 92, 255, 0.32)',
      'rgba(238, 242, 246, 0.28)'
    ];

    function spawn(p) {
      p.x = Math.random() * W;
      p.y = Math.random() * H;
      p.px = p.x;
      p.py = p.y;
      p.vx = 0;
      p.vy = 0;
      p.speed = 0.55 + Math.random() * 1.1;
      p.life = 140 + Math.random() * 260;
      p.color = COLORS[(Math.random() * COLORS.length) | 0];
      p.width = 0.7 + Math.random() * 0.9;
      return p;
    }

    function resize() {
      W = hero.offsetWidth;
      H = hero.offsetHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = '#04060B';
      ctx.fillRect(0, 0, W, H);
      const count = Math.min(Math.floor((W * H) / 11000), 300);
      particles = Array.from({ length: count }, () => spawn({}));
    }

    function fieldAngle(x, y, t) {
      const a = Math.cos(x * 0.0016 + t * 0.32) + Math.sin(y * 0.0019 - t * 0.27);
      const b = Math.sin((x + y) * 0.0008 + t * 0.15);
      return (a + b) * 1.35;
    }

    let t = 0;
    function frame() {
      raf = null;
      if (!heroVisible) return;
      t += 0.008;

      ctx.fillStyle = 'rgba(4, 6, 11, 0.065)';
      ctx.fillRect(0, 0, W, H);
      ctx.lineCap = 'round';

      for (const p of particles) {
        const ang = fieldAngle(p.x, p.y, t);
        p.vx += Math.cos(ang) * 0.07 * p.speed;
        p.vy += Math.sin(ang) * 0.07 * p.speed;

        // Mouse repulsion
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 16900) {
          const d = Math.sqrt(d2) || 1;
          const f = (130 - d) / 130 * 0.9;
          p.vx += (dx / d) * f;
          p.vy += (dy / d) * f;
        }

        p.vx *= 0.94;
        p.vy *= 0.94;

        p.px = p.x;
        p.py = p.y;
        p.x += p.vx;
        p.y += p.vy;
        p.life--;

        // Wrap or respawn without drawing a streak
        if (p.life <= 0 || p.x < -10 || p.x > W + 10 || p.y < -10 || p.y > H + 10) {
          spawn(p);
          continue;
        }

        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.width;
        ctx.beginPath();
        ctx.moveTo(p.px, p.py);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      }
      raf = requestAnimationFrame(frame);
    }

    // rAF throttles itself when the tab is hidden/occluded — no manual
    // document.hidden gating (an early-return there can kill the loop for good).
    function kick() {
      if (!raf && heroVisible) raf = requestAnimationFrame(frame);
    }

    hero.addEventListener('mousemove', (e) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    }, { passive: true });
    hero.addEventListener('mouseleave', () => {
      mouse.x = -9999;
      mouse.y = -9999;
    });

    new IntersectionObserver((entries) => {
      heroVisible = entries[0].isIntersecting;
      kick();
    }).observe(hero);

    let resizeTimer;
    addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 200);
    });

    resize();
    kick();
  }

  /* ---------- Scroll reveals ---------- */
  const revealIO = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        revealIO.unobserve(e.target);
      }
    }
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('[data-reveal]').forEach((el) => revealIO.observe(el));

  /* ---------- Manifesto word reveal ---------- */
  const manifesto = document.getElementById('manifesto');
  const manifestoText = document.getElementById('manifestoText');
  if (manifestoText) {
    // Wrap every word in a span, preserving <em> emphasis
    function splitWords(node) {
      for (const child of Array.from(node.childNodes)) {
        if (child.nodeType === Node.TEXT_NODE) {
          const frag = document.createDocumentFragment();
          const parts = child.textContent.split(/(\s+)/);
          for (const part of parts) {
            if (/^\s+$/.test(part) || part === '') {
              frag.appendChild(document.createTextNode(part.length ? ' ' : ''));
            } else {
              const s = document.createElement('span');
              s.className = 'w';
              s.textContent = part;
              frag.appendChild(s);
            }
          }
          node.replaceChild(frag, child);
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          splitWords(child);
        }
      }
    }
    splitWords(manifestoText);
    const words = manifestoText.querySelectorAll('.w');

    if (!reduced) {
      let ticking = false;
      function updateManifesto() {
        ticking = false;
        const rect = manifesto.getBoundingClientRect();
        const total = rect.height - innerHeight;
        if (total <= 0) return;
        const p = Math.max(0, Math.min(1, -rect.top / total));
        const active = Math.floor(p * words.length * 1.25);
        words.forEach((w, i) => w.classList.toggle('on', i < active));
      }
      addEventListener('scroll', () => {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(updateManifesto);
        }
      }, { passive: true });
      updateManifesto();
    }
  }

  /* ---------- Counters ---------- */
  const counterIO = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      counterIO.unobserve(e.target);
      const el = e.target;
      const target = parseInt(el.dataset.count, 10);
      if (reduced || target === 0) {
        el.textContent = target;
        continue;
      }
      const dur = 1400;
      const start = performance.now();
      (function step(now) {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 4);
        el.textContent = Math.round(eased * target);
        if (p < 1) requestAnimationFrame(step);
      })(performance.now());
    }
  }, { threshold: 0.5 });
  document.querySelectorAll('[data-count]').forEach((el) => counterIO.observe(el));

  /* ---------- Magnetic buttons ---------- */
  if (finePointer && !reduced) {
    document.querySelectorAll('.magnetic').forEach((el) => {
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * 0.28;
        const y = (e.clientY - r.top - r.height / 2) * 0.28;
        el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = '';
      });
    });
  }

  /* ---------- Card tilt + spotlight ---------- */
  if (finePointer && !reduced) {
    document.querySelectorAll('.tilt, .work-card').forEach((el) => {
      const lift = el.classList.contains('work-card') ? -6 : 0;
      el.addEventListener('pointerenter', () => {
        el.style.transition = 'transform 0.18s ease-out, border-color 0.35s';
      });
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const px = e.clientX - r.left;
        const py = e.clientY - r.top;
        el.style.setProperty('--mx', px + 'px');
        el.style.setProperty('--my', py + 'px');
        const rotY = ((px / r.width) - 0.5) * 5;
        const rotX = (0.5 - (py / r.height)) * 5;
        el.style.transform =
          `perspective(900px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) translateY(${lift}px)`;
      });
      el.addEventListener('pointerleave', () => {
        el.style.transition = 'transform 0.55s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.35s';
        el.style.transform = '';
        setTimeout(() => { el.style.transition = ''; }, 600);
      });
    });
  }

  /* ---------- Terminal typing ---------- */
  const termOut = document.getElementById('termOut');
  if (termOut) {
    const SCRIPT = [
      '$ optiflow init --problem "real"',
      '▸ scanning pain points… found 47',
      '▸ ranking by impact… done',
      '$ optiflow build --mode ship',
      '▸ prototype ready — day 6',
      '▸ deploying to production ✓',
      '$ optiflow status',
      '● all systems: perfect'
    ];
    const CURSOR = '<span class="term-cursor">▊</span>';
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

    function render(text) {
      termOut.innerHTML = text.replace(/&/g, '&amp;').replace(/</g, '&lt;') + CURSOR;
    }

    if (reduced) {
      render(SCRIPT.join('\n'));
    } else {
      let started = false;
      const termIO = new IntersectionObserver(async (entries) => {
        if (!entries[0].isIntersecting || started) return;
        started = true;
        termIO.disconnect();
        for (;;) {
          let buffer = '';
          for (const line of SCRIPT) {
            for (const ch of line) {
              buffer += ch;
              render(buffer);
              await sleep(line.startsWith('$') ? 42 : 14);
            }
            buffer += '\n';
            render(buffer);
            await sleep(line.startsWith('$') ? 200 : 420);
          }
          await sleep(3600);
        }
      }, { threshold: 0.4 });
      termIO.observe(termOut);
    }
  }

  /* ---------- Headline glitch ---------- */
  if (!reduced) {
    const glitchEl = document.querySelector('.glitch');
    if (glitchEl) {
      (function glitchLoop() {
        setTimeout(() => {
          glitchEl.classList.add('glitching');
          setTimeout(() => glitchEl.classList.remove('glitching'), 340);
          glitchLoop();
        }, 2800 + Math.random() * 3600);
      })();
    }
  }

  /* ---------- Nav behavior ---------- */
  const nav = document.getElementById('nav');
  let lastY = scrollY;
  addEventListener('scroll', () => {
    const y = scrollY;
    nav.classList.toggle('scrolled', y > 10);
    if (!document.body.classList.contains('menu-open')) {
      if (y > 160 && y - lastY > 4) nav.classList.add('hidden');
      else if (lastY - y > 4 || y < 160) nav.classList.remove('hidden');
    }
    lastY = y;
  }, { passive: true });

  /* ---------- Mobile menu ---------- */
  const burger = document.getElementById('navBurger');
  const mobileMenu = document.getElementById('mobileMenu');

  function setMenu(open) {
    document.body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    mobileMenu.setAttribute('aria-hidden', String(!open));
  }
  burger.addEventListener('click', () =>
    setMenu(!document.body.classList.contains('menu-open'))
  );
  mobileMenu.querySelectorAll('a').forEach((a) =>
    a.addEventListener('click', () => setMenu(false))
  );
  addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.body.classList.contains('menu-open')) setMenu(false);
  });
})();
