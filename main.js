/* ============================================================
   OPTIFLOW STUDIO — main.js
   Preloader boot, neural-core canvas, cursor, decode text,
   reveals, manifesto scrub, counters, magnetic, tilt,
   terminal, glitch, HUD, nav.
   ============================================================ */

(() => {
  'use strict';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;

  /* ---------- Preloader ---------- */
  const preCount = document.getElementById('preCount');
  const preBar = document.getElementById('preBar');
  const preMsg = document.getElementById('preMsg');
  const PRELOAD_MS = reduced ? 0 : 1100;
  const BOOT_MSGS = [
    [0, 'BOOT SEQUENCE INITIATED'],
    [30, 'LOADING NEURAL CORE'],
    [62, 'CALIBRATING CRAZY'],
    [92, 'ALL SYSTEMS: PERFECT']
  ];

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
      for (const [threshold, msg] of BOOT_MSGS) {
        if (val >= threshold) preMsg.textContent = msg;
      }
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

  /* ---------- Neural-core canvas: matrix word-rain + 3D core ---------- */
  const canvas = document.getElementById('field');
  if (canvas && !reduced) {
    const ctx = canvas.getContext('2d');
    const hero = document.querySelector('.hero');
    const dpr = Math.min(devicePixelRatio || 1, 2);
    let W = 0, H = 0;
    let cols = [];
    const mouse = { x: -9999, y: -9999 };

    const WORDS = ['OPTIFLOW', 'SHIP', 'AGENTS', 'PROOF', 'REAL', 'BUILD', 'EVALS', 'RAG', '01', 'AI'];
    const CELL = 18;
    const RAIN_COLORS = [
      'rgba(0, 240, 255, 0.85)',
      'rgba(0, 240, 255, 0.55)',
      'rgba(139, 92, 255, 0.80)',
      'rgba(139, 92, 255, 0.50)',
      'rgba(255, 46, 151, 0.55)'
    ];

    /* 3D core: points on a fibonacci sphere + nearest-neighbor links */
    const CORE_N = 300;
    const corePts = [];
    const GA = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < CORE_N; i++) {
      const y = 1 - (i / (CORE_N - 1)) * 2;
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      corePts.push({ x: Math.cos(GA * i) * r, y, z: Math.sin(GA * i) * r });
    }
    const links = [];
    for (let i = 0; i < CORE_N && links.length < 900; i++) {
      for (let j = i + 1; j < CORE_N; j++) {
        const a = corePts[i], b = corePts[j];
        if (a.x * b.x + a.y * b.y + a.z * b.z > 0.955) links.push([i, j]);
      }
    }
    const proj = new Array(CORE_N);
    let rotY = 0, rotX = 0.12, targetRX = 0.12;

    function spawnCol(c, x) {
      c.x = x;
      c.y = -CELL * (2 + Math.random() * 26);
      c.speed = 0.5 + Math.random() * 1.6;
      c.word = WORDS[(Math.random() * WORDS.length) | 0];
      c.ci = 0;
      c.acc = Math.random();
      c.color = RAIN_COLORS[(Math.random() * RAIN_COLORS.length) | 0];
      return c;
    }

    function resize() {
      W = hero.offsetWidth;
      H = hero.offsetHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = '#030409';
      ctx.fillRect(0, 0, W, H);
      cols = [];
      for (let x = 0; x < W; x += CELL) cols.push(spawnCol({}, x));
    }

    let t = 0;
    function frame() {
      t += 0.008;

      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = 'rgba(3, 4, 9, 0.05)';
      ctx.fillRect(0, 0, W, H);

      /* --- matrix word-rain (additive) --- */
      ctx.globalCompositeOperation = 'lighter';
      ctx.font = '600 14px "JetBrains Mono", monospace';
      ctx.textBaseline = 'top';
      for (const c of cols) {
        let sp = c.speed;
        if (mouse.x > 0 && Math.abs(c.x - mouse.x) < 70) sp += 1.4;
        c.acc += sp * 0.22;
        if (c.acc < 1) continue;
        c.acc = 0;
        c.y += CELL;
        if (c.y > H + CELL * 4) { spawnCol(c, c.x); continue; }
        if (c.y < 0) continue;
        const prev = c.word[c.ci % c.word.length];
        c.ci++;
        const head = c.word[c.ci % c.word.length];
        ctx.fillStyle = c.color;
        ctx.fillText(prev, c.x, c.y - CELL);
        ctx.fillStyle = 'rgba(235, 250, 255, 0.9)';
        ctx.fillText(head, c.x, c.y);
      }

      /* --- 3D neural core --- */
      const narrow = W < 760;
      const R = Math.min(W, H) * (narrow ? 0.24 : 0.30);
      const cx = narrow ? W * 0.5 : W * 0.73;
      const cy = narrow ? H * 0.30 : H * 0.44;
      const pulse = 1 + 0.035 * Math.sin(t * 2.4);

      rotY += 0.0022 + (mouse.x > 0 ? (mouse.x / W - 0.5) * 0.004 : 0);
      targetRX = mouse.y > 0 ? (mouse.y / H - 0.5) * 0.9 : 0.12;
      rotX += (targetRX - rotX) * 0.04;

      const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
      const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
      const f = 2.4;

      for (let i = 0; i < CORE_N; i++) {
        const p = corePts[i];
        const x1 = p.x * cosY + p.z * sinY;
        const z1 = -p.x * sinY + p.z * cosY;
        const y2 = p.y * cosX - z1 * sinX;
        const z2 = p.y * sinX + z1 * cosX;
        const s = f / (f - z2);
        proj[i] = {
          x: cx + x1 * R * pulse * s,
          y: cy + y2 * R * pulse * s,
          s,
          d: (z2 + 1) / 2
        };
      }

      ctx.lineWidth = 0.6;
      for (let i = 0; i < links.length; i++) {
        const a = proj[links[i][0]], b = proj[links[i][1]];
        const alpha = 0.04 + 0.11 * ((a.d + b.d) / 2);
        ctx.strokeStyle = (i % 3 === 0)
          ? `rgba(139, 92, 255, ${alpha})`
          : `rgba(0, 240, 255, ${alpha})`;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }

      for (let i = 0; i < CORE_N; i++) {
        const q = proj[i];
        ctx.fillStyle = `rgba(0, 240, 255, ${0.05 + 0.05 * q.d})`;
        ctx.beginPath();
        ctx.arc(q.x, q.y, 5 * q.s, 0, 6.2832);
        ctx.fill();
        ctx.fillStyle = `rgba(230, 250, 255, ${0.25 + 0.55 * q.d})`;
        ctx.beginPath();
        ctx.arc(q.x, q.y, 1.3 * q.s, 0, 6.2832);
        ctx.fill();
      }

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

    let resizeTimer;
    addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 200);
    });

    resize();
    // Unkillable loop: re-arm FIRST so nothing can break the chain,
    // then draw only while the hero is on screen.
    (function loop() {
      requestAnimationFrame(loop);
      const r = hero.getBoundingClientRect();
      if (r.bottom <= 0 || r.top >= innerHeight) return;
      frame();
    })();
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

  /* ---------- Decode / scramble text on reveal ---------- */
  if (!reduced) {
    const DECODE_CHARS = '▚▞▟#@$%&<>/\\|*+=~10';
    function decodeEl(el) {
      const nodes = [];
      (function walk(n) {
        n.childNodes.forEach((c) => {
          if (c.nodeType === Node.TEXT_NODE && c.textContent.trim()) nodes.push(c);
          else if (c.nodeType === Node.ELEMENT_NODE) walk(c);
        });
      })(el);
      nodes.forEach((node) => {
        const orig = node.textContent;
        const len = orig.length;
        const dur = 500 + len * 14;
        const start = performance.now();
        (function step(now) {
          const p = Math.min((now - start) / dur, 1);
          const solved = Math.floor(p * len);
          let out = '';
          for (let i = 0; i < len; i++) {
            out += i < solved || orig[i] === ' '
              ? orig[i]
              : DECODE_CHARS[(Math.random() * DECODE_CHARS.length) | 0];
          }
          node.textContent = out;
          if (p < 1) requestAnimationFrame(step);
          else node.textContent = orig;
        })(start);
      });
    }
    const decodeIO = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          decodeIO.unobserve(e.target);
          decodeEl(e.target);
        }
      }
    }, { threshold: 0.5 });
    document.querySelectorAll('.eyebrow, .section-head h2').forEach((el) => decodeIO.observe(el));
  }

  /* ---------- Manifesto word reveal ---------- */
  const manifesto = document.getElementById('manifesto');
  const manifestoText = document.getElementById('manifestoText');
  if (manifestoText) {
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
        const rotYv = ((px / r.width) - 0.5) * 5;
        const rotXv = (0.5 - (py / r.height)) * 5;
        el.style.transform =
          `perspective(900px) rotateX(${rotXv.toFixed(2)}deg) rotateY(${rotYv.toFixed(2)}deg) translateY(${lift}px)`;
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

  /* ---------- Nav + HUD scroll behavior ---------- */
  const nav = document.getElementById('nav');
  const progressBar = document.getElementById('progressBar');
  const scrollPct = document.getElementById('scrollPct');
  const heroContent = document.querySelector('.hero-content');
  let lastY = scrollY;

  addEventListener('scroll', () => {
    const y = scrollY;
    nav.classList.toggle('scrolled', y > 10);
    if (!document.body.classList.contains('menu-open')) {
      if (y > 160 && y - lastY > 4) nav.classList.add('hidden');
      else if (lastY - y > 4 || y < 160) nav.classList.remove('hidden');
    }
    lastY = y;

    const total = document.documentElement.scrollHeight - innerHeight;
    const pct = total > 0 ? Math.min(100, Math.round((y / total) * 100)) : 0;
    progressBar.style.width = pct + '%';
    scrollPct.textContent = String(pct).padStart(3, '0');
    document.body.classList.toggle('at-end', pct >= 97);

    if (!reduced && heroContent && y < innerHeight) {
      heroContent.style.transform = `translateY(${(y * 0.28).toFixed(1)}px)`;
      heroContent.style.opacity = Math.max(0, 1 - y / (innerHeight * 0.85)).toFixed(3);
    }
  }, { passive: true });

  /* ---------- HUD rail active section ---------- */
  const railLinks = document.querySelectorAll('.hud-rail a');
  if (railLinks.length) {
    const byTarget = new Map();
    railLinks.forEach((a) => {
      const id = a.getAttribute('href').slice(1);
      const el = id === 'top' ? document.querySelector('.hero') : document.getElementById(id);
      if (el) byTarget.set(el, a);
    });
    const railIO = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          railLinks.forEach((a) => a.classList.remove('active'));
          const link = byTarget.get(e.target);
          if (link) link.classList.add('active');
        }
      }
    }, { rootMargin: '-40% 0px -40% 0px' });
    byTarget.forEach((_, el) => railIO.observe(el));
  }

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
