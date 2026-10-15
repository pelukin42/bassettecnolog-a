---
name: imagenes
description: Crea, optimiza e integra imágenes para el sitio web de Bassett Tecnología (fibra óptica, cableado, racks, cámaras, redes, impresoras) usando Higgsfield, o con los visuales generados en código si no hay créditos. Úsalo cuando el usuario pida imágenes, fotos, fondos, ilustraciones, banners o recursos gráficos del sitio, o diga /imagenes.
argument-hint: [qué imagen o sección necesita]
---

# /imagenes — Imágenes del sitio de Bassett Tecnología

Responde en español. Este skill reúne todo lo aprendido al crear las imágenes del sitio: estilo de marca, prompts listos, cómo generarlas, optimizarlas e integrarlas, y qué hacer cuando Higgsfield no tiene créditos.

## Autorización y límites

- El usuario autorizó usar **Higgsfield para imágenes del sitio sin pedir permiso cada vez**.
- Aun así: antes de generar, mire `balance` y haga una prueba de costo (`get_cost: true`). Informe al usuario cuánto se gastó.
- **No** use `use_free_gens` ni `use_unlim` salvo que el usuario lo pida explícitamente.
- Si un envío falla por plan o créditos (ver abajo), **no reintente en bucle**: pase al plan B.

## Estilo de marca (úselo en todos los prompts)

- Paleta del logo: azul marino profundo (`#061239`), azul eléctrico (`#2b6fff`), cian (`#3cc3ff`), con acentos cálidos naranja/amarillo (`#ff8a1f`, `#ffc72c`) y un toque de rojo.
- Mood: tecnológico, limpio, cinematográfico, fotorrealista, gradación azul marino con luz cálida de acento.
- Siempre añadir al prompt: `no text, no logos, no brand names, no watermark`.
- Evitar personas identificables y marcas reales de equipos.
- Las imágenes generadas con IA son **ilustrativas**: nunca presentarlas como "nuestros trabajos" ni como clientes/proyectos reales. Si se muestran en una comparación o galería, rotular "Ilustración referencial".

## Flujo

### 1. Revisar cupo
1. `mcp__Higgsfield__balance` (cargar con ToolSearch si hace falta: `select:mcp__Higgsfield__balance,mcp__Higgsfield__generate_image_batch,mcp__Higgsfield__jobs_wait,mcp__Higgsfield__show_generation_by_ids`).
2. `mcp__Higgsfield__get_preferences` (si `auto_create_project` es false, no pase `folder_id`).
3. Modelo por defecto: **`gpt_image_2_5`** (`quality: medium`, `resolution: 1k` para tarjetas, `2k` para portada/anchos). Cuesta ≈1 crédito por imagen en medium. Si el usuario quiere otro estilo, `models_explore` → `recommend`.

### 2. Generar
- Use `generate_image_batch` (hasta 12 solicitudes independientes) con los prompts de [prompts.md](prompts.md).
- Espere con `jobs_wait` (máx. 15 s por llamada, repita hasta que todos estén terminales) y luego **una sola** llamada a `show_generation_by_ids` con todos los trabajos.
- Antes/después alineados: genere primero el rack desordenado y luego edite *esa misma imagen* como referencia (`medias: [{value: <job_id>, role: "image_references"}]`) con el prompt del rack ordenado, para que la composición coincida.

### 3. Descargar y optimizar
1. Tome las URLs de resultado de `jobs_wait`/`show_generation_by_ids` y descárguelas con `curl` a una carpeta **nueva y vacía** (p. ej. el scratchpad), no dentro del proyecto. Si falla por TLS/proxy, vea `/root/.ccr/README.md`; nunca desactive la verificación TLS.
2. Optimice (WebP, ancho máx. 1600 px, calidad 80):
   ```bash
   python3 -I .claude/skills/imagenes/scripts/optimize.py <carpeta_descargas> assets/img --max 1600 --quality 80
   ```
   Metas de peso: portada ≤ 250 KB, tarjetas ≤ 120 KB, resto ≤ 150 KB.
3. Nombres sugeridos (ver tabla en prompts.md): `hero-fibra.webp`, `rack-desordenado.webp`, `rack-ordenado.webp`, `camara-cctv.webp`, etc.

### 4. Integrar en el sitio (sin tocar el HTML)
Todo se activa desde `assets/js/config.js`:

| Imagen | Dónde se configura | Efecto |
|---|---|---|
| Fondo de portada | `imagenes.heroFondo: 'assets/img/hero-fibra.webp'` | Foto oscurecida bajo la fibra óptica animada |
| Antes/después | `imagenes.cableadoAntes` y `imagenes.cableadoDespues` (las dos) | Reemplaza las ilustraciones SVG del comparador |
| Foto en tarjeta de servicio | `servicios[i].imagen: 'assets/img/…'` | Encabezado de imagen en la tarjeta |
| Imagen para redes | reemplazar `assets/img/og-image.jpg` (1200×630) | Vista previa al compartir el enlace |

Reglas: `alt=""` (decorativas; ya lo hace el código), `loading="lazy"` (ya incluido), mantener la relación 16:10 en tarjetas y comparador.

### 5. Verificar
- Servir en local (`http-server . -p 8123`) y comprobar en Chromium con Playwright (`/opt/pw-browsers/chromium`): sin errores de consola, sin desborde horizontal en 390 px, imágenes cargadas (`naturalWidth > 0`).
- Revisar una captura de escritorio y una móvil.
- Si el sitio está publicado como Artifact de vista previa, republicarlo (las imágenes nuevas deben ir en `files`).
- Commit en la rama de trabajo indicada. No crear PR salvo que lo pidan.

## Plan B: sin créditos o sin plan (lo que pasó al crear el sitio)

Si Higgsfield responde `Requires basic plan or higher` u `Out of credits`:
1. **No insista** ni cambie de modelo en bucle (se probaron `gpt_image_2_5`, `nano_banana_2`, `flux_2`, `z_image`: todos rechazados en la cuenta gratuita sin créditos).
2. Informe al usuario con claridad que no se pudo generar y por qué; ofrezca recargar créditos o subir fotos propias.
3. Use los **visuales generados en código**, que ya están en el sitio:
   - `assets/js/visuals.js` → `initHeroFibers(canvas, host)` (fibra óptica animada con pulsos de luz y parallax) y `rackSvg('before' | 'after')` (rack desordenado vs. estructurado en SVG).
   - `assets/js/app.js` → red interactiva (`initNetwork`), comparador (`initBeforeAfter`), diagnóstico (`initDiagnostic`), marquesina.
   - Ajustes de color: variables CSS al inicio de `assets/css/styles.css`.
4. Cuando haya créditos, ejecute el flujo normal: las fotos se superponen o reemplazan los visuales vía `config.js`.

## Scripts incluidos

| Script | Para qué |
|---|---|
| `scripts/optimize.py` | Redimensiona y comprime (WebP/JPG) imágenes descargadas |
| `scripts/extract_logo.py FLYER.png assets/img` | Recorta globo y texto del logo desde el flyer, con fondo transparente |
| `scripts/make_icons.py assets/img` | Regenera favicon, apple-touch-icon y `og-image.jpg` a partir del logo |

El logo actual salió de un flyer de 960 px: si el usuario consigue el original (SVG o PNG grande), reemplace `assets/img/logo-white.png` y `globe.png`, y vuelva a correr `make_icons.py`.

## Pedido actual

$ARGUMENTS
