#!/usr/bin/env node
/* Prueba rápida del sitio en un navegador real (Chromium + Playwright).
 *
 * Uso:  node smoke_test.js http://localhost:8123 [carpeta_capturas]
 * Variables opcionales: PLAYWRIGHT_MODULE (ruta del módulo), CHROMIUM_PATH (ejecutable)
 * Sale con código 1 si algo falla.
 */
const fs = require('fs');
let pw;
for (const m of [process.env.PLAYWRIGHT_MODULE, 'playwright', '/opt/node-tools/node_modules/playwright']) {
  if (!m) continue;
  try { pw = require(m); break; } catch (e) { /* siguiente */ }
}
if (!pw) { console.error('No se encontró Playwright (defina PLAYWRIGHT_MODULE).'); process.exit(2); }

const URL = process.argv[2] || 'http://localhost:8123/';
const SHOTS = process.argv[3];
const results = [];
const ok = (name, cond, extra = '') => results.push([cond ? 'PASS' : 'FAIL', name, extra]);

(async () => {
  const exe = process.env.CHROMIUM_PATH || (fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined);
  const browser = await pw.chromium.launch({ executablePath: exe, args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 1360, height: 900 }, locale: 'es-CR' });
  await ctx.route('https://wa.me/**', (r) => r.fulfill({ status: 200, contentType: 'text/html', body: 'ok' }));
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !/net::|Failed to load resource|fonts\.g|google/i.test(m.text())) errors.push(m.text()); });
  await page.goto(URL, { waitUntil: 'load' });
  await page.addStyleTag({ content: 'html{scroll-behavior:auto!important}.wa-bubble{display:none!important}' });
  await page.waitForTimeout(1200);

  const C = await page.evaluate(() => window.SITE_CONFIG);
  ok('config cargada', !!C && !!C.nombre, C && C.nombre);
  ok('sin errores JS al cargar', errors.length === 0, errors.join(' | '));
  ok('sin variables {{…}} visibles', !(await page.content()).includes('{{'));
  ok('servicios renderizados', (await page.locator('.svc').count()) === C.servicios.length);
  ok('cotizador: una opción por servicio', (await page.locator('.pick').count()) === C.servicios.length);
  ok('estadísticas', (await page.locator('.stat').count()) === C.estadisticas.length);
  ok('preguntas frecuentes', (await page.locator('.faq__item').count()) === C.faq.length);
  ok('canvas de la portada pintado', await page.evaluate(() => { const c = document.getElementById('hero-canvas'); const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; for (let i = 3; i < d.length; i += 400) if (d[i] > 0) return true; return false; }));
  ok('enlace de WhatsApp correcto', (await page.locator('a[data-wa]').first().getAttribute('href')).startsWith('https://wa.me/' + C.whatsapp.replace(/\D/g, '')));

  // Red interactiva
  await page.click('button.node >> nth=1');
  ok('red interactiva: el panel cambia', /./.test(await page.locator('#net-panel h3').innerText()));

  // Antes / después
  await page.locator('.ba__handle').focus();
  await page.keyboard.press('End');
  ok('comparador: teclado', (await page.locator('.ba__handle').getAttribute('aria-valuenow')) === '100');

  // Diagnóstico
  await page.click('.issue >> nth=0');
  await page.click('[data-act="next"]');
  ok('diagnóstico: llega a la recomendación', (await page.locator('.tips li').count()) >= 3);

  // Cotizador → WhatsApp
  await page.click('.pick__head >> nth=0');
  await page.fill('#q-nombre', 'Prueba Automática');
  const [pop] = await Promise.all([ctx.waitForEvent('page'), page.click('#q-send-wa')]);
  const msg = decodeURIComponent(pop.url().split('text=')[1] || '').replace(/\+/g, ' ');
  await pop.close();
  ok('cotizador: mensaje de WhatsApp', msg.includes('Prueba Automática') && msg.includes(C.servicios[0].nombre), msg.slice(0, 80).replace(/\n/g, ' '));

  // Tema
  const t0 = await page.evaluate(() => document.documentElement.dataset.theme);
  await page.click('#theme-toggle');
  ok('tema claro/oscuro', t0 !== (await page.evaluate(() => document.documentElement.dataset.theme)));

  if (SHOTS) {
    fs.mkdirSync(SHOTS, { recursive: true });
    await page.evaluate(() => scrollTo(0, 0));
    await page.screenshot({ path: SHOTS + '/escritorio.png' });
  }

  // Móvil
  const m = await (await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })).newPage();
  const merr = [];
  m.on('pageerror', (e) => merr.push(e.message));
  await m.goto(URL, { waitUntil: 'load' });
  await m.waitForTimeout(1000);
  ok('móvil: sin desborde horizontal', (await m.evaluate(() => document.documentElement.scrollWidth - innerWidth)) <= 0);
  ok('móvil: sin errores JS', merr.length === 0, merr.join(' | '));
  if (SHOTS) await m.screenshot({ path: SHOTS + '/movil.png' });

  await browser.close();
  for (const r of results) console.log(r[0], '-', r[1], r[2] ? `  [${r[2]}]` : '');
  const f = results.filter((r) => r[0] === 'FAIL').length;
  console.log(`\n${results.length - f}/${results.length} pruebas correctas`);
  process.exit(f ? 1 : 0);
})().catch((e) => { console.error('ERROR del script:', e); process.exit(2); });
