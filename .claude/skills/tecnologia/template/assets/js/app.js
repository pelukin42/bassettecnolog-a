/* ==========================================================================
   {{NOMBRE}} — Lógica del sitio
   Los datos (contacto, servicios, FAQ…) viven en assets/js/config.js
   ========================================================================== */
(() => {
  'use strict';

  const C = window.SITE_CONFIG;
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

  if (/0{6,}/.test(digits(C.whatsapp))) {
    console.warn('[Sitio] El número de WhatsApp en config.js es un marcador de posición.');
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
      areaServed: C.paisISO,
      address: Object.assign({ '@type': 'PostalAddress', addressCountry: C.paisISO }, C.direccion && C.direccion !== C.pais ? { streetAddress: C.direccion } : {}),
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
        ${s.imagen ? `<div class="svc__media"><img src="${esc(s.imagen)}" alt="" loading="lazy" width="640" height="400"></div>` : ''}
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

    // Foco de luz que sigue al cursor
    $('#svc-grid').addEventListener('pointermove', (e) => {
      const c = e.target.closest('.svc');
      if (!c) return;
      const r = c.getBoundingClientRect();
      c.style.setProperty('--mx', `${e.clientX - r.left}px`);
      c.style.setProperty('--my', `${e.clientY - r.top}px`);
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
      $('#sum-total').textContent = `${C.moneda}${total.toLocaleString(C.locale || 'es-CR')}`;
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
      safe(() => localStorage.setItem('site-theme', next));
    });

    // Cabecera + botón «subir»
    const totop = $('#totop');
    const progress = $('#progress');
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        header.classList.toggle('is-scrolled', window.scrollY > 8);
        totop.classList.toggle('is-visible', window.scrollY > 700);
        const max = document.documentElement.scrollHeight - window.innerHeight;
        progress.style.setProperty('--p', max > 0 ? Math.min(1, window.scrollY / max).toFixed(4) : '0');
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
    if (safe(() => sessionStorage.getItem('site-wa-bubble'))) return;
    const hide = () => { bubble.hidden = true; safe(() => sessionStorage.setItem('site-wa-bubble', '1')); };
    $('#wa-bubble-close').addEventListener('click', hide);
    setTimeout(() => { bubble.hidden = false; setTimeout(hide, 12000); }, 6000);
  }


  /* ==========================================================================
     Marquesina
     ========================================================================== */
  function renderMarquee() {
    const items = [...C.tiposTrabajo, ...C.servicios.map((x) => x.nombre)];
    const group = `<div class="marquee__group">${items.map((t) => `<span class="marquee__item">${esc(t)}</span>`).join('')}</div>`;
    $('#marquee').innerHTML = group + group;
  }

  /* ==========================================================================
     Red interactiva: cada elemento enlaza con un servicio
     ========================================================================== */
  function initNetwork() {
    const stage = $('#net-stage');
    if (!stage) return;

    const VBW = 900, VBH = 560, NS = 'http://www.w3.org/2000/svg';
    const ALL_NODES = [
      { id: 'internet', x: 450, y: 55, icono: 'globe', label: 'Internet', info: true },
      { id: 'firewall', x: 450, y: 165, icono: 'shield', label: 'Firewall', svc: 'ciberseguridad' },
      { id: 'switch', x: 450, y: 290, icono: 'network', label: 'Switch y rack', svc: 'cableado' },
      { id: 'ap', x: 190, y: 175, icono: 'wifi', label: 'Wi-Fi', svc: 'redes' },
      { id: 'pc', x: 120, y: 375, icono: 'monitor', label: 'PC y laptops', svc: 'pc' },
      { id: 'camara', x: 740, y: 160, icono: 'video', label: 'Cámaras', svc: 'camaras' },
      { id: 'impresora', x: 785, y: 355, icono: 'printer', label: 'Impresoras', svc: 'impresoras' },
      { id: 'copiadora', x: 615, y: 485, icono: 'files', label: 'Fotocopiadoras', svc: 'fotocopiadoras' },
      { id: 'soporte', x: 285, y: 485, icono: 'headset', label: 'Soporte', svc: 'soporte' }
    ];
    const ALL_LINKS = [['internet', 'firewall'], ['firewall', 'switch'], ['switch', 'ap', 1], ['switch', 'pc'], ['switch', 'camara'], ['switch', 'impresora'], ['switch', 'copiadora'], ['switch', 'soporte', 1]];
    const ALL_CYCLE = ['switch', 'ap', 'pc', 'camara', 'impresora', 'copiadora', 'soporte', 'firewall'];

    // Si un servicio no está en config.js, su nodo (y sus enlaces) se omiten.
    const NODES = ALL_NODES.filter((n) => !n.svc || svcById[n.svc]);
    const ids = new Set(NODES.map((n) => n.id));
    const LINKS = ALL_LINKS.filter(([a, b]) => ids.has(a) && ids.has(b));
    const CYCLE = ALL_CYCLE.filter((id) => ids.has(id));
    if (!CYCLE.length) { const sec = stage.closest('section'); if (sec) sec.hidden = true; return; }
    const byId = Object.fromEntries(NODES.map((n) => [n.id, n]));

    // Enlaces (curvas suaves)
    const linksG = $('#net-links'), pktG = $('#net-packets');
    const links = LINKS.map(([a, b, dashed]) => {
      const A = byId[a], B = byId[b];
      const dx = B.x - A.x, dy = B.y - A.y, len = Math.hypot(dx, dy) || 1;
      const bend = A.x === B.x ? 0 : 0.14 * len;
      const cx = (A.x + B.x) / 2 + (-dy / len) * bend, cy = (A.y + B.y) / 2 + (dx / len) * bend;
      const path = document.createElementNS(NS, 'path');
      path.setAttribute('d', `M${A.x} ${A.y} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${B.x} ${B.y}`);
      path.setAttribute('class', `net__link${dashed ? ' is-dashed' : ''}`);
      linksG.appendChild(path);
      return { a, b, path, len: path.getTotalLength() };
    });

    // Paquetes de datos que viajan por los enlaces
    const packets = [];
    links.forEach((l) => {
      const n = 2 + (Math.random() < 0.5 ? 1 : 0);
      for (let i = 0; i < n; i++) {
        const el = document.createElementNS(NS, 'circle');
        el.setAttribute('r', '6.5');
        el.setAttribute('fill', Math.random() < 0.3 ? 'url(#pkt-gold)' : 'url(#pkt-cyan)');
        pktG.appendChild(el);
        packets.push({ l, el, t: Math.random(), v: 0.12 + Math.random() * 0.16, dir: Math.random() < 0.5 ? 1 : -1 });
      }
    });
    const place = (p) => {
      const pt = p.l.path.getPointAtLength((p.dir > 0 ? p.t : 1 - p.t) * p.l.len);
      p.el.setAttribute('cx', pt.x.toFixed(1));
      p.el.setAttribute('cy', pt.y.toFixed(1));
    };
    let raf = 0, last = 0;
    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
      last = now;
      for (const p of packets) {
        p.t += p.v * dt;
        if (p.t > 1) { p.t = 0; p.dir = Math.random() < 0.5 ? 1 : -1; }
        place(p);
      }
    };
    packets.forEach(place);

    // Nodos (botones accesibles sobre el SVG)
    const nodesBox = $('#net-nodes');
    nodesBox.innerHTML = NODES.map((n) => {
      const style = `left:${((n.x / VBW) * 100).toFixed(2)}%;top:${((n.y / VBH) * 100).toFixed(2)}%`;
      const inner = `<span class="node__icon">${icon(n.icono)}</span><span class="node__label">${esc(n.label)}</span>`;
      return n.info
        ? `<div class="node node--info" style="${style}">${inner}</div>`
        : `<button type="button" class="node" data-node="${n.id}" style="${style}" aria-label="${esc(n.label)}" aria-pressed="false">${inner}</button>`;
    }).join('');

    const panel = $('#net-panel');
    let auto = !reduceMotion, idx = 0, timer = 0;

    function select(id) {
      const n = byId[id];
      const svc = n && svcById[n.svc];
      if (!svc) return;
      $$('.node[data-node]', nodesBox).forEach((b) => {
        const on = b.dataset.node === id;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-pressed', String(on));
      });
      links.forEach((l) => l.path.classList.toggle('is-on', l.a === id || l.b === id));
      panel.setAttribute('aria-live', auto ? 'off' : 'polite');
      panel.innerHTML = `
        <span class="net__panel-icon">${icon(svc.icono)}</span>
        <h3>${esc(svc.nombre)}</h3>
        <p>${esc(svc.descripcion)}</p>
        <ul>${svc.puntos.map((p) => `<li>${icon('check')}<span>${esc(p)}</span></li>`).join('')}</ul>
        <div class="net__actions">
          <button type="button" class="btn btn--accent btn--sm" data-quote="${esc(svc.id)}">Cotizar ${icon('arrow')}</button>
          <a class="btn btn--ghost btn--sm" href="${waUrl(`Hola ${C.nombre}, quisiera información sobre: ${svc.nombre}.`)}" target="_blank" rel="noopener">${icon('whatsapp')}WhatsApp</a>
        </div>`;
    }

    nodesBox.addEventListener('click', (e) => {
      const b = e.target.closest('[data-node]');
      if (!b) return;
      auto = false;
      clearInterval(timer);
      select(b.dataset.node);
    });

    const tick = () => { idx = (idx + 1) % CYCLE.length; select(CYCLE[idx]); };
    const startTimer = () => { clearInterval(timer); if (auto) timer = setInterval(tick, 5200); };
    stage.addEventListener('pointerenter', () => clearInterval(timer));
    stage.addEventListener('pointerleave', startTimer);

    select(CYCLE[0]);

    if (!reduceMotion && 'IntersectionObserver' in window) {
      new IntersectionObserver((en) => {
        if (en[0].isIntersecting) { if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); } startTimer(); }
        else { cancelAnimationFrame(raf); raf = 0; clearInterval(timer); }
      }, { threshold: 0.15 }).observe(stage);
    }
  }

  /* ==========================================================================
     Comparador antes / después (cableado)
     ========================================================================== */
  function initBeforeAfter() {
    const ba = $('#ba');
    if (!ba || !window.SiteVisuals) return;
    const photos = C.imagenes && C.imagenes.cableadoAntes && C.imagenes.cableadoDespues;
    $('#ba-before').innerHTML = photos ? `<img src="${esc(C.imagenes.cableadoAntes)}" alt="" loading="lazy">` : window.SiteVisuals.rackSvg('before');
    $('#ba-after').innerHTML = photos ? `<img src="${esc(C.imagenes.cableadoDespues)}" alt="" loading="lazy">` : window.SiteVisuals.rackSvg('after');

    const handle = $('.ba__handle', ba);
    let pos = 50, demo = 0, dragging = false;
    const set = (p) => {
      pos = Math.max(0, Math.min(100, p));
      ba.style.setProperty('--pos', `${pos}%`);
      handle.setAttribute('aria-valuenow', String(Math.round(pos)));
    };
    const stopDemo = () => { cancelAnimationFrame(demo); demo = 0; };
    const fromEvent = (e) => { const r = ba.getBoundingClientRect(); set(((e.clientX - r.left) / r.width) * 100); };

    ba.addEventListener('pointerdown', (e) => { stopDemo(); dragging = true; ba.setPointerCapture(e.pointerId); fromEvent(e); });
    ba.addEventListener('pointermove', (e) => { if (dragging) fromEvent(e); });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach((t) => ba.addEventListener(t, () => { dragging = false; }));
    handle.addEventListener('keydown', (e) => {
      const step = e.shiftKey ? 10 : 4;
      const map = { ArrowLeft: -step, ArrowDown: -step, ArrowRight: step, ArrowUp: step };
      if (e.key in map) { stopDemo(); set(pos + map[e.key]); e.preventDefault(); }
      else if (e.key === 'Home') { stopDemo(); set(0); e.preventDefault(); }
      else if (e.key === 'End') { stopDemo(); set(100); e.preventDefault(); }
    });
    set(50);

    // Pequeña demostración al entrar en pantalla
    if (!reduceMotion && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver((en) => {
        if (!en[0].isIntersecting) return;
        io.disconnect();
        const t0 = performance.now(), dur = 3000;
        const step = (now) => {
          const k = Math.min(1, (now - t0) / dur);
          set(50 + Math.sin(k * Math.PI * 2) * 32);
          if (k < 1) demo = requestAnimationFrame(step); else set(50);
        };
        demo = requestAnimationFrame(step);
      }, { threshold: 0.6 });
      io.observe(ba);
    }
  }

  /* ==========================================================================
     Diagnóstico rápido
     ========================================================================== */
  function initDiagnostic() {
    const root = $('#diag');
    if (!root) return;
    const ISSUES = (Array.isArray(C.diagnostico) ? C.diagnostico : []).filter((d) => svcById[d.servicio]);
    if (!ISSUES.length) {
      const sec = root.closest('section');
      if (sec) sec.hidden = true;
      $$('a[href="#diagnostico"]').forEach((a) => { a.hidden = true; });
      return;
    }

    const STEPS = ['Problema', 'Detalles', 'Recomendación'];
    const WHO = ['Empresa', 'Domicilio'];
    const URG = ['Puedo esperar', 'Hoy mismo', 'Detiene mi operación'];
    const st = { step: 1, issue: null, who: WHO[0], urg: URG[0] };
    const issue = () => ISSUES.find((d) => d.id === st.issue);

    const stepper = () => `<ol class="diag__steps" aria-label="Progreso del diagnóstico">${STEPS.map((t, i) =>
      `<li class="diag__step${st.step === i + 1 ? ' is-on' : ''}${st.step > i + 1 ? ' is-done' : ''}"${st.step === i + 1 ? ' aria-current="step"' : ''}><span>${t}</span></li>`).join('')}</ol>`;

    const seg = (name, label, opts, cur) => `
      <div class="qgroup"><span class="qgroup__label" id="${name}-l">${label}</span>
        <div class="seg" role="radiogroup" aria-labelledby="${name}-l">${opts.map((v) =>
          `<label class="seg__opt"><input type="radio" name="${name}" value="${esc(v)}"${v === cur ? ' checked' : ''}><span>${esc(v)}</span></label>`).join('')}</div>
      </div>`;

    function body() {
      if (st.step === 1) {
        return `<h3 class="diag__q">¿Cuál de estos problemas se parece más al suyo?</h3>
          <div class="issues">${ISSUES.map((d) => `
            <button type="button" class="issue" data-issue="${esc(d.id)}">
              <span class="issue__icon">${icon(d.icono)}</span>
              <span><strong>${esc(d.titulo)}</strong><small>${esc(d.detalle)}</small></span>
            </button>`).join('')}</div>`;
      }
      const d = issue();
      if (st.step === 2) {
        return `<h3 class="diag__q">${esc(d.titulo)}</h3>
          <div class="diag__ctx">${seg('dg-who', '¿Para quién es?', WHO, st.who)}${seg('dg-urg', '¿Qué tan urgente es?', URG, st.urg)}</div>
          <div class="diag__nav">
            <button type="button" class="btn btn--outline" data-act="back">${icon('back')}Atrás</button>
            <button type="button" class="btn btn--primary" data-act="next">Ver recomendación ${icon('arrow')}</button>
          </div>`;
      }
      const svc = svcById[d.servicio];
      const urgent = st.urg !== URG[0];
      const msg = `Hola ${C.nombre}, necesito ayuda con esto:\n*Problema:* ${d.titulo}\n*Es para:* ${st.who}\n*Urgencia:* ${st.urg}\n(Consulta desde el diagnóstico rápido del sitio)`;
      return `<div class="diag__result">
          <div class="diag__tips">
            <h3>Primeros pasos que puede intentar</h3>
            <ol class="tips">${d.tips.map((t) => `<li>${esc(t)}</li>`).join('')}</ol>
            <p class="diag__note">Si algo no le resulta claro, no insista: es mejor no mover nada y consultarnos.</p>
          </div>
          <div class="diag__rec">
            <span class="pill">${esc(st.urg)}</span>
            <div class="diag__rec-head"><span class="net__panel-icon">${icon(svc.icono)}</span><div><small>Le recomendamos</small><strong>${esc(svc.nombre)}</strong></div></div>
            <p>${esc(svc.descripcion)}</p>
            <div class="summary__actions">
              <a class="btn btn--wa btn--block" href="${waUrl(msg)}" target="_blank" rel="noopener">${icon('whatsapp')}${urgent ? 'Escribir ahora por WhatsApp' : 'Consultar por WhatsApp'}</a>
              <button type="button" class="btn btn--accent btn--block" data-act="quote">Agregar al cotizador</button>
              <button type="button" class="btn btn--ghost btn--block" data-act="reset">${icon('refresh')}Empezar de nuevo</button>
            </div>
          </div>
        </div>
        <div class="diag__nav"><button type="button" class="btn btn--outline" data-act="back">${icon('back')}Atrás</button></div>`;
    }

    function render(focus) {
      root.innerHTML = `${stepper()}<div class="diag__body" tabindex="-1">${body()}</div>`;
      if (focus) {
        const b = $('.diag__body', root);
        b.focus({ preventScroll: true });
        const r = root.getBoundingClientRect();
        if (r.top < 0 || r.bottom > window.innerHeight) root.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      }
    }

    root.addEventListener('click', (e) => {
      const pick = e.target.closest('[data-issue]');
      if (pick) { st.issue = pick.dataset.issue; st.step = 2; render(true); return; }
      const btn = e.target.closest('[data-act]');
      if (!btn) return;
      const act = btn.dataset.act;
      if (act === 'back') { st.step = Math.max(1, st.step - 1); render(true); }
      else if (act === 'next') { st.step = 3; render(true); }
      else if (act === 'reset') { st.step = 1; st.issue = null; render(true); }
      else if (act === 'quote') {
        if (st.urg !== URG[0]) qForm.elements.urgencia.value = 'Urgente';
        selectService(issue().servicio);
      }
    });
    root.addEventListener('change', (e) => {
      if (e.target.name === 'dg-who') st.who = e.target.value;
      if (e.target.name === 'dg-urg') st.urg = e.target.value;
    });

    render(false);
  }

  /* ---------- Arranque ---------- */
  bindStatic();
  if (C.imagenes && C.imagenes.heroFondo) {
    const hero = $('#inicio');
    hero.style.setProperty('--hero-img', `url("${C.imagenes.heroFondo}")`);
    hero.classList.add('has-img');
  }
  renderStats();
  renderMarquee();
  renderServices();
  initQuote();
  initContact();
  renderFaq();
  initChrome();
  initHeroRotator();
  initWaBubble();
  initNetwork();
  initBeforeAfter();
  initDiagnostic();
  if (window.SiteVisuals) window.SiteVisuals.initHeroFibers($('#hero-canvas'), $('#inicio'));

  // Cualquier botón [data-quote] agrega ese servicio al cotizador.
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-quote]');
    if (b) selectService(b.dataset.quote);
  });
})();
