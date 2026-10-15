/* ==========================================================================
   {{NOMBRE}} — Visuales generados en código
   - Fibra óptica animada (canvas) para la portada
   - Ilustraciones SVG de un rack: cableado desordenado vs. estructurado
   No dependen de imágenes externas: pesan casi nada y se adaptan al tema.
   ========================================================================== */
(() => {
  'use strict';

  const reduce = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);

  /* ----------------------------------------------------------------------
     Fibra óptica (canvas)
     ---------------------------------------------------------------------- */
  function initHeroFibers(canvas, host) {
    const ctx = canvas && canvas.getContext && canvas.getContext('2d');
    if (!ctx || !host) return;

    const PALETTE = ['#3cc3ff', '#3cc3ff', '#7db4ff', '#ffc72c', '#ff8a1f'];
    const rnd = (a, b) => a + Math.random() * (b - a);
    const pick = () => PALETTE[(Math.random() * PALETTE.length) | 0];

    let W = 1, H = 1, dpr = 1, raf = 0, last = 0, time = 0;
    let px = 0, py = 0, tx = 0, ty = 0;
    let fibers = [];

    function build() {
      const n = W < 700 ? 22 : 40;
      fibers = Array.from({ length: n }, () => {
        const depth = rnd(0.25, 1);
        return {
          y0: rnd(0.45, 1.2), y3: rnd(-0.2, 0.6), c1: rnd(0.18, 0.4), c2: rnd(0.55, 0.82),
          a1: rnd(0.04, 0.2), a2: rnd(0.04, 0.2), ph: rnd(0, 6.28), sp: rnd(0.12, 0.4),
          w: 0.6 + depth * 1.6, depth,
          pulses: Array.from({ length: Math.random() < 0.4 ? 2 : 1 }, () => ({ t: Math.random(), v: rnd(0.05, 0.14), c: pick() }))
        };
      });
    }

    function points(f) {
      const sw1 = Math.sin(time * f.sp + f.ph) * f.a1;
      const sw2 = Math.cos(time * f.sp * 0.8 + f.ph) * f.a2;
      const ox = px * 26 * f.depth, oy = py * 14 * f.depth;
      return [
        -0.1 * W + ox, f.y0 * H + oy,
        f.c1 * W + ox, (f.y0 + (f.y3 - f.y0) * 0.2 + sw1) * H + oy,
        f.c2 * W + ox, (f.y0 + (f.y3 - f.y0) * 0.8 + sw2) * H + oy,
        1.1 * W + ox, f.y3 * H + oy
      ];
    }

    function bez(p, t) {
      const u = 1 - t, a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, d = t * t * t;
      return [a * p[0] + b * p[2] + c * p[4] + d * p[6], a * p[1] + b * p[3] + c * p[5] + d * p[7]];
    }

    function draw(dt) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'lighter';
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      for (const f of fibers) {
        const p = points(f);
        ctx.beginPath();
        ctx.moveTo(p[0], p[1]);
        ctx.bezierCurveTo(p[2], p[3], p[4], p[5], p[6], p[7]);
        ctx.strokeStyle = `rgba(70,150,255,${0.07 + 0.16 * f.depth})`;
        ctx.lineWidth = f.w;
        ctx.stroke();

        for (const s of f.pulses) {
          s.t += s.v * dt;
          if (s.t > 1.06) { s.t = -0.06; s.c = pick(); s.v = rnd(0.05, 0.14); }
          if (s.t < 0 || s.t > 1) continue;

          // estela
          ctx.beginPath();
          for (let k = 0; k <= 6; k++) {
            const q = bez(p, Math.max(0, s.t - 0.07 * (1 - k / 6)));
            if (k === 0) ctx.moveTo(q[0], q[1]); else ctx.lineTo(q[0], q[1]);
          }
          ctx.strokeStyle = s.c + '88';
          ctx.lineWidth = f.w * 1.5;
          ctx.stroke();

          // destello
          const [x, y] = bez(p, s.t);
          const r = 8 + 16 * f.depth;
          const g = ctx.createRadialGradient(x, y, 0, x, y, r);
          g.addColorStop(0, 'rgba(255,255,255,.95)');
          g.addColorStop(0.25, s.c + 'cc');
          g.addColorStop(1, s.c + '00');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(x, y, r, 0, 6.2832);
          ctx.fill();
        }
      }
    }

    function resize() {
      const r = host.getBoundingClientRect();
      W = Math.max(1, r.width);
      H = Math.max(1, r.height);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      build();
      if (reduce) draw(0);
    }

    function loop(now) {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
      last = now;
      time += dt;
      px += (tx - px) * 0.06;
      py += (ty - py) * 0.06;
      draw(dt);
    }
    const start = () => { if (!raf && !reduce && !document.hidden) { last = performance.now(); raf = requestAnimationFrame(loop); } };
    const stop = () => { cancelAnimationFrame(raf); raf = 0; };

    resize();
    if ('ResizeObserver' in window) new ResizeObserver(resize).observe(host);
    else window.addEventListener('resize', resize);

    if (reduce) return;
    host.addEventListener('pointermove', (e) => {
      const r = host.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
    }, { passive: true });
    document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
    if ('IntersectionObserver' in window) {
      new IntersectionObserver((e) => (e[0].isIntersecting ? start() : stop()), { threshold: 0 }).observe(host);
    } else start();
  }

  /* ----------------------------------------------------------------------
     Rack: antes (desordenado) y después (estructurado)
     ---------------------------------------------------------------------- */
  function rackSvg(mode) {
    const messy = mode === 'before';
    const id = (n) => `${n}-${mode}`;

    // Generador pseudoaleatorio con semilla: el dibujo es siempre el mismo.
    let seed = messy ? 11 : 5;
    const rand = () => {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    const R = (a, b) => a + rand() * (b - a);
    const f1 = (n) => Math.round(n * 10) / 10;

    const COLORS = ['#e5322d', '#ffc72c', '#2ecc71', '#f1f5ff', '#2b6fff', '#ff8a1f', '#b06cff', '#3cc3ff'];
    const X0 = 250, PW = 300, N = 24;
    const portX = (i) => X0 + 15 + i * ((PW - 30) / (N - 1));
    const devs = [
      { y: 44, h: 34, k: 'pp' }, { y: 150, h: 34, k: 'sw' },
      { y: 238, h: 34, k: 'pp' }, { y: 344, h: 34, k: 'sw' },
      { y: 430, h: 52, k: 'ups' }
    ];
    const pairs = [[0, 1], [2, 3]];
    const idxs = Array.from({ length: 16 }, (_, k) => Math.round((k * 23) / 15));

    let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">`;

    // Fondo
    s += `<defs>
      <linearGradient id="${id('bg')}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${messy ? '#2b1418' : '#0a1d5c'}"/><stop offset="1" stop-color="${messy ? '#0c0910' : '#050d2b'}"/>
      </linearGradient>
      <radialGradient id="${id('glow')}" cx=".5" cy=".42" r=".6">
        <stop offset="0" stop-color="${messy ? '#ff6a3d' : '#3cc3ff'}" stop-opacity="${messy ? '.22' : '.3'}"/><stop offset="1" stop-color="${messy ? '#ff6a3d' : '#3cc3ff'}" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="${id('dev')}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#26335f"/><stop offset="1" stop-color="#141c3d"/>
      </linearGradient>
    </defs>`;
    s += `<rect width="800" height="500" fill="url(#${id('bg')})"/><rect width="800" height="500" fill="url(#${id('glow')})"/>`;

    // Estructura del rack
    s += `<rect x="222" y="12" width="356" height="480" rx="8" fill="#070b1c" stroke="#2c3a6b" stroke-width="2"/>`;
    s += `<rect x="228" y="18" width="18" height="468" fill="#10173a"/><rect x="554" y="18" width="18" height="468" fill="#10173a"/>`;
    for (let y = 30; y < 484; y += 22) s += `<circle cx="237" cy="${y}" r="2.2" fill="#02040c"/><circle cx="563" cy="${y}" r="2.2" fill="#02040c"/>`;

    // Organizador horizontal (solo en el rack ordenado)
    if (!messy) {
      pairs.forEach(([a, b]) => {
        const ym = (devs[a].y + devs[a].h + devs[b].y) / 2 - 5;
        s += `<rect x="${X0}" y="${ym}" width="${PW}" height="10" rx="2" fill="#0d1433" stroke="#33437f"/>`;
        for (let i = 0; i < 12; i++) s += `<rect x="${X0 + 10 + i * 24}" y="${ym + 3}" width="14" height="4" rx="1" fill="#02040c"/>`;
      });
    }

    // Equipos
    devs.forEach((d) => {
      s += `<rect x="${X0}" y="${d.y}" width="${PW}" height="${d.h}" rx="3" fill="url(#${id('dev')})" stroke="#3b4c8a"/>`;
      if (d.k === 'ups') {
        s += `<rect x="${X0 + 14}" y="${d.y + 14}" width="64" height="24" rx="3" fill="#03130f" stroke="#2f6f5b"/>`;
        s += `<rect x="${X0 + 22}" y="${d.y + 22}" width="38" height="4" fill="#2ecc71"/><rect x="${X0 + 22}" y="${d.y + 30}" width="22" height="3" fill="#2ecc71" opacity=".55"/>`;
        for (let i = 0; i < 6; i++) s += `<circle cx="${X0 + 130 + i * 28}" cy="${d.y + 26}" r="7" fill="#02040c" stroke="#4a5da0" stroke-width=".8"/>`;
        return;
      }
      const py0 = d.k === 'pp' ? d.y + d.h - 17 : d.y + 6;
      for (let i = 0; i < N; i++) s += `<rect x="${f1(portX(i) - 4.5)}" y="${py0}" width="9" height="11" rx="1.2" fill="#03050d" stroke="#4a5da0" stroke-width=".6"/>`;
      if (d.k === 'sw') for (let i = 0; i < 4; i++) s += `<circle cx="${X0 + PW - 12 - i * 9}" cy="${d.y + d.h - 8}" r="2" fill="${i % 2 ? '#2ecc71' : '#ffc72c'}"/>`;
    });

    const startY = (d) => devs[d].y + devs[d].h - 12;
    const endY = (d) => devs[d].y + 11.5;

    if (messy) {
      // ------ Cables enredados ------
      pairs.forEach(([a, b]) => {
        const ends = idxs.slice();
        for (let i = ends.length - 1; i > 0; i--) { const j = (rand() * (i + 1)) | 0; [ends[i], ends[j]] = [ends[j], ends[i]]; }
        idxs.forEach((si, k) => {
          const x1 = portX(si), y1 = startY(a), x2 = portX(ends[k]), y2 = endY(b);
          const wide = rand() < 0.35 ? (rand() < 0.5 ? -1 : 1) * R(150, 240) : 0;
          const c1x = x1 + (wide || R(-130, 130)), c1y = y1 + R(30, 110);
          const c2x = x2 + (wide || R(-130, 130)), c2y = y2 - R(30, 110);
          const d = `M${f1(x1)} ${f1(y1)} C${f1(c1x)} ${f1(c1y)} ${f1(c2x)} ${f1(c2y)} ${f1(x2)} ${f1(y2)}`;
          const col = COLORS[(rand() * COLORS.length) | 0];
          s += `<path d="${d}" fill="none" stroke="#000" stroke-opacity=".55" stroke-width="6.2" stroke-linecap="round"/>`;
          s += `<path d="${d}" fill="none" stroke="${col}" stroke-width="3.3" stroke-linecap="round"/>`;
          s += `<rect x="${f1(x1 - 3.5)}" y="${f1(y1 - 3)}" width="7" height="8" rx="1.5" fill="${col}"/><rect x="${f1(x2 - 3.5)}" y="${f1(y2 - 5)}" width="7" height="8" rx="1.5" fill="${col}"/>`;
        });
      });
      // Cables sueltos que cuelgan del rack
      for (let k = 0; k < 8; k++) {
        const x1 = portX(2 + k * 3), y1 = devs[3].y + devs[3].h - 8;
        const x2 = x1 + R(-170, 170), y2 = R(470, 560);
        const d = `M${f1(x1)} ${f1(y1)} C${f1(x1 + R(-90, 90))} ${f1(y1 + R(60, 120))} ${f1(x2 + R(-80, 80))} ${f1(y2 - R(60, 110))} ${f1(x2)} ${f1(y2)}`;
        const col = COLORS[(rand() * COLORS.length) | 0];
        s += `<path d="${d}" fill="none" stroke="#000" stroke-opacity=".55" stroke-width="6.2" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${col}" stroke-width="3.3" stroke-linecap="round"/>`;
      }
      // Etiqueta caída
      s += `<rect x="520" y="404" width="26" height="12" rx="2" fill="#f1f5ff" transform="rotate(-14 533 410)"/>`;
    } else {
      // ------ Cables estructurados ------
      pairs.forEach(([a, b], pi) => {
        idxs.forEach((si, k) => {
          const x = portX(si), y1 = startY(a), y2 = endY(b);
          const col = (Math.floor(k / 4) + pi) % 2 ? '#3cc3ff' : '#2b6fff';
          const d = `M${f1(x)} ${f1(y1)} C${f1(x)} ${f1(y1 + 28)} ${f1(x)} ${f1(y2 - 28)} ${f1(x)} ${f1(y2)}`;
          s += `<path d="${d}" fill="none" stroke="#000" stroke-opacity=".5" stroke-width="5.4" stroke-linecap="round"/>`;
          s += `<path d="${d}" fill="none" stroke="${col}" stroke-width="3" stroke-linecap="round"/>`;
          s += `<rect x="${f1(x - 3.5)}" y="${f1(y1 - 3)}" width="7" height="8" rx="1.5" fill="${col}"/><rect x="${f1(x - 3.5)}" y="${f1(y2 - 5)}" width="7" height="8" rx="1.5" fill="${col}"/>`;
          if (k % 4 === 1) s += `<rect x="${f1(x - 5)}" y="${f1(y1 + 12)}" width="10" height="5" rx="1" fill="#f1f5ff"/>`;
        });
        // Cintas de velcro
        [0, 8].forEach((g) => {
          const x1 = portX(idxs[g]) - 7, x2 = portX(idxs[g + 7]) + 7;
          const ym = (devs[a].y + devs[a].h + devs[b].y) / 2 - 16;
          s += `<rect x="${f1(x1)}" y="${f1(ym)}" width="${f1(x2 - x1)}" height="6" rx="2" fill="#ff8a1f"/>`;
        });
      });
      // Luces de actividad
      s += `<circle cx="${X0 + PW - 12}" cy="${devs[1].y + devs[1].h - 8}" r="4" fill="#2ecc71" opacity=".35"/>`;
    }

    return s + '</svg>';
  }

  window.SiteVisuals = { initHeroFibers, rackSvg };
})();
