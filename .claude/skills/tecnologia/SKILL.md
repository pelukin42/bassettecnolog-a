---
name: tecnologia
description: Crea un sitio web completo y dinámico para un negocio de tecnología o soporte técnico (computadoras, redes, cableado, cámaras, impresoras, ciberseguridad) a partir de la plantilla de Bassett Tecnología: portada con fibra óptica animada, servicios, red interactiva, antes/después de cableado, diagnóstico rápido, cotizador en línea, botones de WhatsApp, mapa, redes sociales y paleta propia. Úsalo cuando el usuario pida una página web, sitio o landing para un negocio de TI o tecnología, o diga /tecnologia.
argument-hint: [nombre del negocio y datos de contacto]
---

# /tecnologia — Sitio web para negocios de tecnología

Responde en español. Esta habilidad genera, personaliza, prueba y entrega un sitio **estático** (HTML + CSS + JS, sin compilar) con la plantilla del sitio de Bassett Tecnología, lista para Netlify, GitHub Pages o cualquier hosting.

## Qué incluye la plantilla (`template/`)

| Sección | Qué hace |
|---|---|
| Portada | Fibra óptica animada (canvas), titular rotativo, cifras animadas, marquesina |
| Servicios | Tarjetas filtrables, botón *Cotizar* y *WhatsApp* por servicio |
| Red interactiva | Diagrama con paquetes de datos; cada elemento muestra su servicio |
| Antes/después | Comparador de rack con cableado desordenado vs. estructurado (ilustración) |
| Diagnóstico rápido | Problema → detalles → recomendación → WhatsApp / cotizador |
| Cotizador | 3 pasos, resumen en vivo; envía por WhatsApp, correo o copia el texto |
| Contacto | Formulario, tarjetas, mapa (Google Maps/Waze), redes sociales |
| Extras | Botón flotante de WhatsApp, modo claro/oscuro, FAQ, SEO básico, `_headers` para Netlify |

Todos los datos del negocio viven en `assets/js/config.js` (contacto, redes, servicios, FAQ, diagnóstico, cifras).

## Dónde está esta habilidad

```bash
SK=$(ls -d ~/.claude/skills/tecnologia .claude/skills/tecnologia 2>/dev/null | head -1); echo $SK
```

## Flujo

### 1. Reunir los datos (no inventar nada)
**Obligatorios:** nombre del negocio, dominio (o URL), WhatsApp con código de país (solo dígitos), teléfono, correo.
**Opcionales:** dirección/referencia para el mapa, redes sociales, años de experiencia, certificaciones, país/moneda, logo, color preferido.

- Si faltan obligatorios, **pregúntelos** (AskUserQuestion o texto). No los deduzca ni los invente.
- Si el usuario envía un flyer o imagen con datos, extráigalos y confírmelos.
- **Solo** use `--anios` y `--iso` si el negocio realmente lo afirma. Nunca agregue clientes, testimonios, precios, horarios o direcciones inventados.

### 2. Generar el sitio
```bash
python3 -I $SK/scripts/scaffold.py --out <carpeta> \
  --nombre "Acme Tech" --dominio acme.cr \
  --whatsapp 50688880000 --telefono "+506 8888 0000" --correo ventas@acme.cr \
  [--direccion "…"] [--facebook URL --instagram URL --tiktok URL --youtube URL --linkedin URL] \
  [--anios 12] [--iso] [--pais "Costa Rica" --pais-iso CR --locale es-CR --moneda "₡"] \
  [--paleta azul|turquesa|verde|morado|magenta|rojo|<tono 0-360>] \
  [--logo logo.png [--logo-blanco]] [--icono icono.png]
```
- Crea la carpeta con el sitio, el logo, favicon, `apple-touch-icon` e imagen para redes (`og-image.jpg`).
- Sin `--logo` genera un **logo provisional** con las iniciales: dígaselo al usuario y pida el real.
- El logo debe ser PNG con **fondo transparente** y trazo claro (la cabecera es oscura); con `--logo-blanco` se convierte a silueta blanca.
- `--paleta` rota solo la familia de azules (el naranja/amarillo de acento no cambia).

### 3. Personalizar el contenido (`assets/js/config.js`)
1. **Servicios:** deje solo los que el negocio ofrece (id, nombre, descripción, puntos, unidad). Si quita un servicio, el diagrama de red y el diagnóstico omiten sus elementos automáticamente.
2. **Textos de marca en `index.html`:** el titular, la frase de la portada y la lista de verificación (`hero__checks`) mencionan servicios concretos; ajústelos si el negocio es distinto.
3. **FAQ y diagnóstico:** adáptelos. Los consejos del diagnóstico deben ser seguros y generales.
4. **Dirección, horario y redes:** si no hay datos, déjelos vacíos (el sitio los oculta o dice «consulte por WhatsApp»).
5. **Precios:** `servicios[i].desde` en `null` = el cotizador no muestra precios. Póngalos solo si el cliente los da.
6. **Fotos:** `imagenes.heroFondo`, `imagenes.cableadoAntes/Despues`, `servicios[i].imagen` (ver README). Si usa imágenes de IA, son **ilustrativas**: no las presente como trabajos o clientes reales.

### 4. Verificar
```bash
cd <carpeta> && (npx http-server . -p 8123 -s &)      # servir en local
node $SK/scripts/smoke_test.js http://localhost:8123/ /tmp/capturas
```
La prueba abre Chromium (Playwright), revisa errores de consola, servicios, cotizador → WhatsApp, red interactiva, comparador, diagnóstico, tema y desborde en móvil. Si Playwright no está en la ruta por defecto, use `PLAYWRIGHT_MODULE=/ruta/a/playwright`. Mire las capturas de escritorio y móvil antes de entregar y corrija lo que se vea mal.

### 5. Entregar
- **Vista previa privada (Artifact):** `python3 -I $SK/scripts/preview_html.py <carpeta> <carpeta>/../preview.html "Nombre corto"` y publicar con la herramienta Artifact pasando en `files`: `assets/css/styles.css`, `assets/js/config.js`, `app.js`, `visuals.js`, `assets/img/logo-white.png`, `globe.png`. El mapa incrustado y algunos enlaces no funcionan dentro del visor; avíselo.
- **.zip para Netlify:** `python3 -I $SK/scripts/make_zip.py <carpeta> <salida>.zip` (deja `index.html` en la raíz del zip). Entréguelo con SendUserFile (el archivo debe estar en el directorio de trabajo, scratchpad o memoria). Pasos en Netlify: *Add new site → Deploy manually* y arrastrar el zip o la carpeta.
- **Repositorio:** commit en la rama de trabajo indicada; **no** cree PR salvo que lo pidan.
- Si el dominio final es otro, actualice `canonical`, `og:url`, `og:image`, `sitemap.xml`, `robots.txt` y `sitioWeb`.

### 6. Cerrar con transparencia
Diga qué datos son reales y cuáles quedaron pendientes (dirección, horario, redes, logo provisional, textos generales de FAQ/diagnóstico), y que los claims («+N años», ISO) salieron de lo que el cliente indicó.

## Mantener la plantilla
- La plantilla usa variables `{{NOMBRE}}`, `{{URL}}`, `{{WHATSAPP}}`… y bloques opcionales `<!--ANIOS-->…<!--/ANIOS-->`, `<!--ISO-->`, `<!--EXPERIENCIA-->` (y `/*ANIOS*/…/*/ANIOS*/` en JS). `scaffold.py` los resuelve y falla si queda alguna sin reemplazar.
- Una mejora al sitio debe aplicarse también en `template/` (misma estructura, con variables en lugar de datos reales) y probarse con `scaffold.py` + `smoke_test.js`.
- Sitio de referencia: Bassett Tecnología (repositorio `pelukin42/bassettecnolog-a`).

## Instalación global
- **En esta sesión en la nube** se copia a `~/.claude/skills/tecnologia/`, pero ese disco es temporal.
- **Permanente en la computadora del usuario:** copiar la carpeta `.claude/skills/tecnologia` de este repositorio a `~/.claude/skills/` (macOS/Linux) o `%USERPROFILE%\.claude\skills\` (Windows). Requiere Python 3 con Pillow y NumPy (`pip install pillow numpy`) y Node.js para la prueba.
- El nombre del skill va **sin tilde** (`/tecnologia`): los nombres de skills solo admiten minúsculas, números y guiones.

## Pedido actual

$ARGUMENTS
