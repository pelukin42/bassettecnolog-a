/* ==========================================================================
   BASSETT TECNOLOGÍA — Lógica del sitio
   Los datos (contacto, servicios, FAQ…) viven en assets/js/config.js
   ========================================================================== */
(() => {
  'use strict';

  const C = window.BASSETT_CONFIG;
  if (!C) { console.error('Falta assets/js/config.js'); return; }

  /* ---------- Utilidades ---------- */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const digits = (s) => String(s).replace(/\D/g, '');
  const icon = (name) => `<svg class="icon" aria-hidden="true" focusable="false"><use href="#i-${name}"/></svg>`;
  const safe = (fn) => { try { return fn(); } catch (e) { return null; } };
  const reduceMotion = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;

  const waUrl = (msg) => `https://wa.me/${digits(C.whatsapp)}${msg ? `?text=${encodeURIComponent(msg)}` : ''}`;
  const telUrl = `tel:${String(C.telefono).replace(/[^\d+]/g, '')}`;
  const mailUrl = (subject, body) =>
    `mailto:${C.correo}?subject=${encodeURIComponent(subject || '')}&body=${encodeURIComponent((body || '').replace(/\n/g, '\r\n'))}`;

  if (/^5060*$/.test(digits(C.whatsapp))) {
    console.warn('[Bassett] El número de WhatsApp en config.js es un marcador de posición.');
  }

  /* ---------- Aviso emergente ---------- */
  let toastTimer;
  function toast(msg, isError) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.toggle('is-error', !!isError);
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 4000);
  }

  /* ==========================================================================
     Datos estáticos: contacto, redes, mapa, año
     ========================================================================== */
  function bindStatic() {
    $$('[data-bind]').forEach((el) => { const v = C[el.dataset.bind]; if (v != null) el.textContent = v; });
    $$('[data-wa]').forEach((el) => { el.href = waUrl(el.dataset.msg || C.mensajeWhatsApp); });
    $$('[data-tel]').forEach((el) => { el.href = telUrl; });
    $$('[data-mail]').forEach((el) => { el.href = `mailto:${C.correo}`; });
    $('#year').textContent = new Date().getFullYear();

    // Si el teléfono y el WhatsApp son el mismo número, una sola tarjeta.
    if (digits(C.telefono) === digits(C.whatsapp)) {
      $('#card-tel').remove();
      $('#wa-label').textContent = 'WhatsApp y llamadas';
    }

    // Horario
    const h = $('#horario');
    if (Array.isArray(C.horario) && C.horario.length) {
      h.className = 'hours';
      h.innerHTML = C.horario.map(([d, t]) => `<div><span>${esc(d)}</span><strong>${esc(t)}</strong></div>`).join('');
    } else {
      h.className = 'hours hours--none';
      h.textContent = 'Consulte disponibilidad por WhatsApp.';
    }

    // Redes sociales
    const NETWORKS = { facebook: 'Facebook', instagram: 'Instagram', tiktok: 'TikTok', youtube: 'YouTube', linkedin: 'LinkedIn' };
    const socialsHtml = Object.keys(NETWORKS)
      .filter((k) => C.redes && C.redes[k])
      .map((k) => `<a href="${esc(C.redes[k])}" target="_blank" rel="noopener noreferrer" aria-label="${NETWORKS[k]}" title="${NETWORKS[k]}">${icon(k)}</a>`)
      .join('');
    $$('[data-socials]').forEach((box) => { box.innerHTML = socialsHtml; if (!socialsHtml) box.hidden = true; });
    if (!socialsHtml) { const f = $('.follow'); if (f) f.hidden = true; }

    // Mapa
    const q = encodeURIComponent(C.mapaConsulta || C.direccion);
    $('#map-frame').src = `https://www.google.com/maps?q=${q}&z=${C.mapaZoom || 15}&output=embed`;
    $('#map-google').href = `https://www.google.com/maps/search/?api=1&query=${q}`;
    $('#map-waze').href = `https://waze.com/ul?q=${q}&navigate=yes`;

    // Pie: lista de servicios
    $('#footer-services').innerHTML = C.servicios.map((s) => `<li><a href="#servicios">${esc(s.nombre)}</a></li>`).join('');

    // Datos estructurados (SEO)
    const ld = [{
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: C.nombre,
      url: C.sitioWeb,
      image: `${C.sitioWeb}/assets/img/og-image.jpg`,
      telephone: C.telefono,
      email: C.correo,
      description: 'Soporte técnico informático para empresas y domicilios. Venta, instalación, reparación y mantenimiento de computadoras, redes, cámaras de seguridad, impresoras y fotocopiadoras.',
      areaServed: 'CR',
      address: Object.assign({ '@type': 'PostalAddress', addressCountry: 'CR' }, C.direccion && C.direccion !== 'Costa Rica' ? { streetAddress: C.direccion } : {}),
      sameAs: Object.values(C.redes || {}).filter(Boolean),
      knowsAbout: C.servicios.map((s) => s.nombre)
    }, {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: C.faq.map((f) => ({ '@type': 'Question', name: f.p, acceptedAnswer: { '@type': 'Answer', text: f.r } }))
    }];
    const s = document.createElement('script');
    s.type = 'application/ld+json';
    s.textContent = JSON.stringify(ld);
    document.head.appendChild(s);
  }

  /* ==========================================================================
     Cifras animadas
     ========================================================================== */
  function renderStats() {
    $('#stats').innerHTML = C.estadisticas.map((s) => {
      const num = s.valor != null
        ? `${s.prefijo ? `<em>${esc(s.prefijo)}</em>` : ''}<span data-count="${Number(s.valor)}">${Number(s.valor)}</span>${esc(s.sufijo || '')}`
        : esc(s.texto);
      return `<li class="stat"><span class="stat__num${s.valor != null ? '' : ' stat__num--text'}">${num}</span><span class="stat__label">${esc(s.etiqueta)}</span></li>`;
    }).join('');

    if (reduceMotion || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      io.disconnect();
      $$('[data-count]').forEach((el) => {
        const end = Number(el.dataset.count);
        const t0 = performance.now();
        const dur = 1400;
        const tick = (now) => {
          const p = Math.min(1, (now - t0) / dur);
          el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
          if (p < 1) requestAnimationFrame(tick);
        };
        el.textContent = '0';
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.4 });
    io.observe($('#stats'));
  }

  /* ==========================================================================
     Servicios + filtros
     ========================================================================== */
  function renderServices() {
    $('#filters').innerHTML = C.categorias.map((c, i) =>
      `<button type="button" class="chipbtn" data-cat="${esc(c.id)}" aria-pressed="${i === 0}">${esc(c.nombre)}</button>`).join('');

    $('#svc-grid').innerHTML = C.servicios.map((s, i) => `
      <article class="svc reveal" style="--d:${(i % 4) * 0.06}s" data-cat="${esc(s.categoria)}">
        <div class="svc__icon">${icon(s.icono)}</div>
        <h3>${esc(s.nombre)}</h3>
        <p>${esc(s.descripcion)}</p>
        <ul class="svc__list">${s.puntos.map((p) => `<li>${icon('check')}<span>${esc(p)}</span></li>`).join('')}</ul>
        <div class="svc__actions">
          <button type="button" class="btn btn--primary btn--sm" data-quote="${esc(s.id)}">Cotizar ${icon('arrow')}</button>
          <a class="btn btn--outline btn--sm" href="${waUrl(`Hola ${C.nombre}, quisiera información sobre: ${s.nombre}.`)}" target="_blank" rel="noopener">${icon('whatsapp')}WhatsApp</a>
        </div>
      </article>`).join('');

    $('#filters').addEventListener('click', (e) => {
      const btn = e.target.closest('.chipbtn');
      if (!btn) return;
      $$('.chipbtn', $('#filters')).forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      $$('.svc', $('#svc-grid')).forEach((card) => {
        const show = btn.dataset.cat === 'todos' || card.dataset.cat === btn.dataset.cat;
        card.hidden = !show;
        if (show) {
          card.classList.add('in');
          card.classList.remove('pop');
          void card.offsetWidth; // reinicia la animación
          card.classList.add('pop');
        }
      });
    });

    $('#svc-grid').addEventListener('click', (e) => {
      const b = e.target.closest('[data-quote]');
      if (b) selectService(b.dataset.quote);
    });
  }

  /* ==========================================================================
     Cotizador
     ========================================================================== */
  const svcById = Object.fromEntries(C.servicios.map((s) => [s.id, s]));
  const qForm = $('#quote-form');
  let lastSig = '';

  function renderPicks() {
    $('#quote-picks').innerHTML = C.servicios.map((s) => `
      <div class="pick" data-id="${esc(s.id)}">
        <label class="pick__head">
          <input type="checkbox" name="svc" value="${esc(s.id)}">
          <span class="pick__icon">${icon(s.icono)}</span>
          <span class="pick__name">${esc(s.nombre)}</span>
          <span class="pick__check">${icon('check')}</span>
        </label>
        <div class="pick__more" inert>
          <div class="pick__inner">
            <div class="pick__row">
              <span class="lbl">Tipo de servicio</span>
              <div class="chips">${C.tiposTrabajo.map((t) => `<label class="chip"><input type="checkbox" value="${esc(t)}"><span>${esc(t)}</span></label>`).join('')}</div>
            </div>
            <div class="pick__row">
              <span class="lbl">Cantidad</span>
              <div class="stepper-wrap">
                <div class="stepper">
                  <button type="button" data-step="-1" aria-label="Disminuir cantidad">${icon('minus')}</button>
                  <input type="number" min="1" max="999" value="1" inputmode="numeric" aria-label="Cantidad de ${esc(s.unidad)}">
                  <button type="button" data-step="1" aria-label="Aumentar cantidad">${icon('plus')}</button>
                </div>
                <span class="stepper__unit">${esc(s.unidad)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>`).join('');
  }

  function setPick(pick, on) {
    pick.classList.toggle('is-on', on);
    pick.querySelector('.pick__more').toggleAttribute('inert', !on);
  }

  function selectService(id) {
    const pick = $(`.pick[data-id="${CSS.escape(id)}"]`, qForm);
    if (!pick) return;
    const cb = $('input[name="svc"]', pick);
    if (!cb.checked) { cb.checked = true; setPick(pick, true); }
    $('#err-svc').hidden = true;
    updateSummary();
    $('#cotizador').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    toast(`«${svcById[id].nombre}» agregado a su cotización.`);
  }

  function readQuote() {
    const items = $$('.pick', qForm)
      .filter((p) => $('input[name="svc"]', p).checked)
      .map((p) => ({
        s: svcById[p.dataset.id],
        tipos: $$('.chip input:checked', p).map((i) => i.value),
        cant: Math.min(999, Math.max(1, parseInt($('.stepper input', p).value, 10) || 1))
      }));
    const v = (n) => (qForm.elements[n].value || '').trim();
    return {
      items,
      modalidad: qForm.elements.modalidad.value,
      urgencia: qForm.elements.urgencia.value,
      nombre: v('nombre'), telefono: v('telefono'), correo: v('correo'),
      empresa: v('empresa'), zona: v('zona'), detalle: v('detalle')
    };
  }

  function updateSummary() {
    const q = readQuote();
    $('#sum-count').textContent = q.items.length;
    $('#sum-empty').hidden = q.items.length > 0;

    const sig = JSON.stringify(q.items.map((i) => [i.s.id, i.tipos, i.cant]));
    if (sig !== lastSig) {
      lastSig = sig;
      $('#sum-list').innerHTML = q.items.map((i) =>
        `<li class="sitem"><strong>${esc(i.s.nombre)}</strong><span>${i.tipos.length ? `${esc(i.tipos.join(', '))} · ` : ''}${esc(i.s.unidad)}: ${i.cant}</span></li>`).join('');
    }

    const meta = [['Modalidad', q.modalidad], ['Urgencia', q.urgencia]];
    if (q.zona) meta.push(['Ubicación', q.zona]);
    $('#sum-meta').innerHTML = meta.map(([k, val]) => `<div><dt>${k}</dt><dd>${esc(val)}</dd></div>`).join('');

    // Estimado (solo si hay precios base configurados)
    const priced = q.items.filter((i) => i.s.desde);
    const est = $('#sum-estimate');
    if (priced.length) {
      const total = priced.reduce((sum, i) => sum + i.s.desde * i.cant, 0);
      $('#sum-total').textContent = `${C.moneda}${total.toLocaleString('es-CR')}`;
      $('small', est).textContent = priced.length < q.items.length
        ? 'Precio referencial. Los servicios restantes se cotizan aparte, sujeto a diagnóstico o visita técnica.'
        : 'Precio referencial sujeto a diagnóstico o visita técnica.';
      est.hidden = false;
    } else {
      est.hidden = true;
    }
  }

  function quoteMessage(q) {
    const L = [`Hola ${C.nombre}, quisiera solicitar una cotización.`, '', '*Servicios solicitados*'];
    q.items.forEach((i) => L.push(`• ${i.s.nombre}${i.tipos.length ? ` — ${i.tipos.join(', ')}` : ''} (${i.s.unidad}: ${i.cant})`));
    L.push('', `*Modalidad:* ${q.modalidad}`, `*Urgencia:* ${q.urgencia}`);
    if (q.zona) L.push(`*Ubicación:* ${q.zona}`);
    if (q.detalle) L.push(`*Detalles:* ${q.detalle}`);
    L.push('', '*Mis datos*', `Nombre: ${q.nombre}`);
    if (q.empresa) L.push(`Empresa: ${q.empresa}`);
    if (q.telefono) L.push(`Teléfono: ${q.telefono}`);
    if (q.correo) L.push(`Correo: ${q.correo}`);
    return L.join('\n');
  }

  /* ---------- Validación compartida ---------- */
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // rules: [{ ok, err, el, focus }]. Devuelve true si todo es válido.
  function check(rules) {
    let first = null;
    rules.forEach((r) => {
      const bad = !r.ok;
      const e = $(`#${r.err}`);
      if (e) e.hidden = !bad;
      if (r.el) r.el.setAttribute('aria-invalid', bad ? 'true' : 'false');
      if (bad && !first) first = r.focus || r.el;
    });
    if (first) {
      toast('Revise los campos marcados.', true);
      first.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
      first.focus({ preventScroll: true });
    }
    return !first;
  }

  function phoneOk(value, email, needContact) {
    if (value) return digits(value).length >= 8;
    return !(needContact && !email);
  }

  function validateQuote(needContact) {
    const q = readQuote();
    const f = qForm.elements;
    const ok = check([
      { ok: q.items.length > 0, err: 'err-svc', focus: $('#quote-picks input') },
      { ok: q.nombre.length >= 2, err: 'err-nombre', el: f.nombre },
      { ok: phoneOk(q.telefono, q.correo, needContact), err: 'err-telefono', el: f.telefono },
      { ok: !q.correo || EMAIL_RE.test(q.correo), err: 'err-correo', el: f.correo }
    ]);
    return ok ? q : null;
  }

  /* ---------- Envío ---------- */
  // Un enlace real (en vez de window.open) evita bloqueos de ventanas emergentes.
  function openExternal(url) {
    const a = document.createElement('a');
    a.href = url; a.target = '_blank'; a.rel = 'noopener noreferrer';
    document.body.appendChild(a); a.click(); a.remove();
  }

  function openWhatsApp(msg) {
    openExternal(waUrl(msg));
    toast('Abriendo WhatsApp…');
  }

  function openMail(subject, msg) {
    window.location.href = mailUrl(subject, msg.replace(/\*/g, ''));
    toast('Abriendo su programa de correo…');
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      const ta = document.createElement('textarea');
      ta.value = text; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(ta); ta.select();
      const ok = document.execCommand && document.execCommand('copy');
      ta.remove();
      if (!ok) throw e;
    }
  }

  async function postForm(btn, payload) {
    const label = btn.innerHTML;
    btn.disabled = true;
    try {
      const r = await fetch(C.formEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      toast('¡Solicitud enviada! Le contactaremos pronto.');
      return true;
    } catch (e) {
      toast('No pudimos enviar la solicitud. Inténtelo por WhatsApp o correo.', true);
      return false;
    } finally {
      btn.disabled = false;
      btn.innerHTML = label;
    }
  }

  function initQuote() {
    renderPicks();

    qForm.addEventListener('change', (e) => {
      const t = e.target;
      if (t.name === 'svc') { setPick(t.closest('.pick'), t.checked); $('#err-svc').hidden = true; }
      updateSummary();
    });
    qForm.addEventListener('input', (e) => {
      const n = e.target.name;
      const er = n && $(`#err-${n}`);
      if (er) { er.hidden = true; e.target.removeAttribute('aria-invalid'); }
      updateSummary();
    });
    qForm.addEventListener('click', (e) => {
      const b = e.target.closest('[data-step]');
      if (!b) return;
      const inp = $('input', b.parentElement);
      inp.value = Math.min(999, Math.max(1, (parseInt(inp.value, 10) || 1) + Number(b.dataset.step)));
      updateSummary();
    });
    qForm.addEventListener('submit', (e) => e.preventDefault());

    $('#q-send-wa').addEventListener('click', () => {
      const q = validateQuote(false);
      if (q) openWhatsApp(quoteMessage(q));
    });
    $('#q-send-mail').addEventListener('click', () => {
      const q = validateQuote(false);
      if (q) openMail(`Solicitud de cotización — ${q.nombre}`, quoteMessage(q));
    });
    $('#q-copy').addEventListener('click', async () => {
      const q = readQuote();
      if (!q.items.length) { check([{ ok: false, err: 'err-svc', focus: $('#quote-picks input') }]); return; }
      try { await copyText(quoteMessage({ ...q, nombre: q.nombre || '(su nombre)' })); toast('Resumen copiado al portapapeles.'); }
      catch (e) { toast('No se pudo copiar el resumen.', true); }
    });

    if (C.formEndpoint) {
      const b = $('#q-send-endpoint');
      b.hidden = false;
      b.addEventListener('click', async () => {
        const q = validateQuote(true);
        if (!q) return;
        await postForm(b, {
          tipo: 'cotizacion', nombre: q.nombre, telefono: q.telefono, correo: q.correo, empresa: q.empresa,
          modalidad: q.modalidad, urgencia: q.urgencia, ubicacion: q.zona, detalle: q.detalle,
          servicios: q.items.map((i) => `${i.s.nombre} — ${i.tipos.join(', ') || 'sin especificar'} (${i.s.unidad}: ${i.cant})`).join('\n'),
          mensaje: quoteMessage(q)
        });
      });
    }
    updateSummary();
  }

  /* ==========================================================================
     Formulario de contacto
     ========================================================================== */
  function initContact() {
    const f = $('#contact-form');
    $('#c-asunto').innerHTML = ['Consulta general', ...C.servicios.map((s) => s.nombre), 'Otro']
      .map((o) => `<option>${esc(o)}</option>`).join('');

    const read = () => {
      const v = (n) => (f.elements[n].value || '').trim();
      return { nombre: v('nombre'), telefono: v('telefono'), correo: v('correo'), asunto: v('asunto'), mensaje: v('mensaje') };
    };
    const validate = (needContact) => {
      const d = read();
      const ok = check([
        { ok: d.nombre.length >= 2, err: 'cerr-nombre', el: f.elements.nombre },
        { ok: phoneOk(d.telefono, d.correo, needContact), err: 'cerr-telefono', el: f.elements.telefono },
        { ok: !d.correo || EMAIL_RE.test(d.correo), err: 'cerr-correo', el: f.elements.correo },
        { ok: d.mensaje.length >= 3, err: 'cerr-mensaje', el: f.elements.mensaje }
      ]);
      return ok ? d : null;
    };
    const message = (d) => {
      const L = [`Hola ${C.nombre}, tengo una consulta.`, '', `*Me interesa:* ${d.asunto}`, `*Mensaje:* ${d.mensaje}`, '', '*Mis datos*', `Nombre: ${d.nombre}`];
      if (d.telefono) L.push(`Teléfono: ${d.telefono}`);
      if (d.correo) L.push(`Correo: ${d.correo}`);
      return L.join('\n');
    };

    f.addEventListener('input', (e) => {
      const er = e.target.name && $(`#cerr-${e.target.name}`);
      if (er) { er.hidden = true; e.target.removeAttribute('aria-invalid'); }
    });
    f.addEventListener('submit', (e) => e.preventDefault());
    $('#c-send-wa').addEventListener('click', () => { const d = validate(false); if (d) openWhatsApp(message(d)); });
    $('#c-send-mail').addEventListener('click', () => { const d = validate(false); if (d) openMail(`Consulta web — ${d.asunto}`, message(d)); });

    if (C.formEndpoint) {
      const b = $('#c-send-endpoint');
      b.hidden = false;
      b.addEventListener('click', async () => {
        const d = validate(true);
        if (d && await postForm(b, { tipo: 'contacto', ...d })) f.reset();
      });
    }
  }

  /* ==========================================================================
     FAQ (acordeón)
     ========================================================================== */
  function renderFaq() {
    const box = $('#faq');
    box.innerHTML = C.faq.map((f, i) =>
      `<details class="faq__item"${i === 0 ? ' open' : ''}><summary>${esc(f.p)}${icon('chevron')}</summary><div class="faq__a"><p>${esc(f.r)}</p></div></details>`).join('');
    box.addEventListener('toggle', (e) => {
      if (e.target.open) $$('details', box).forEach((d) => { if (d !== e.target) d.open = false; });
    }, true);
  }

  /* ==========================================================================
     Interacción general: menú, tema, scroll, animaciones, flotantes
     ========================================================================== */
  function initChrome() {
    const header = $('#header');
    const nav = $('#nav');
    const toggle = $('#nav-toggle');

    const closeNav = () => {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Abrir menú');
    };
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    });
    nav.addEventListener('click', (e) => { if (e.target.closest('a')) closeNav(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeNav(); });

    // Tema claro / oscuro
    $('#theme-toggle').addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      safe(() => localStorage.setItem('bassett-theme', next));
    });

    // Cabecera + botón «subir»
    const totop = $('#totop');
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        header.classList.toggle('is-scrolled', window.scrollY > 8);
        totop.classList.toggle('is-visible', window.scrollY > 700);
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    totop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));

    if (!('IntersectionObserver' in window)) { $$('.reveal').forEach((el) => el.classList.add('in')); return; }

    // Aparición al hacer scroll
    const rev = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); rev.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    $$('.reveal').forEach((el) => rev.observe(el));

    // Sección activa en el menú
    const links = new Map($$('.nav__link').map((a) => [a.getAttribute('href').slice(1), a]));
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        links.forEach((a, id) => a.classList.toggle('is-active', id === e.target.id));
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    links.forEach((_, id) => { const s = document.getElementById(id); if (s) spy.observe(s); });
  }

  function initHeroRotator() {
    const rot = $('#rotator');
    if (!rot || reduceMotion) return;
    const words = rot.dataset.words.split(',');
    const word = $('.rotator__word', rot);
    let i = 0;
    setInterval(() => {
      if (document.hidden) return;
      word.classList.add('is-out');
      setTimeout(() => { i = (i + 1) % words.length; word.textContent = words[i]; word.classList.remove('is-out'); }, 360);
    }, 2800);
  }

  function initWaBubble() {
    const bubble = $('#wa-bubble');
    if (safe(() => sessionStorage.getItem('bassett-wa-bubble'))) return;
    const hide = () => { bubble.hidden = true; safe(() => sessionStorage.setItem('bassett-wa-bubble', '1')); };
    $('#wa-bubble-close').addEventListener('click', hide);
    setTimeout(() => { bubble.hidden = false; setTimeout(hide, 12000); }, 6000);
  }

  /* ---------- Arranque ---------- */
  bindStatic();
  renderStats();
  renderServices();
  initQuote();
  initContact();
  renderFaq();
  initChrome();
  initHeroRotator();
  initWaBubble();
})();
