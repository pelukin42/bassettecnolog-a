# Bassett Tecnología — Sitio web

Sitio web dinámico y 100 % estático (HTML + CSS + JavaScript, **sin instalación ni compilación**) para
**Bassett Tecnología**: soporte técnico informático para empresas y domicilios.

## Qué incluye

- Portada con titular dinámico, cifras animadas (+25 años, ISO 9001…) y botones de acción.
- **Servicios** (8) con filtro por categoría, botón *Cotizar* y *WhatsApp* en cada uno.
- **Cotizador en línea** en 3 pasos: elige servicios → tipo de trabajo y cantidad → datos.
  Resumen en vivo y envío por **WhatsApp**, **correo** o copia al portapapeles.
- **Contacto**: formulario, tarjetas (WhatsApp, correo, ubicación, horario), **mapa** con botones
  *Google Maps* y *Waze*, y redes sociales.
- Botón flotante de **WhatsApp** (con mensaje de ayuda), botón *subir*, modo **claro / oscuro**.
- Preguntas frecuentes, sección «Nosotros» y proceso de trabajo.
- SEO básico (meta etiquetas, Open Graph, datos estructurados, `robots.txt`, `sitemap.xml`),
  accesible por teclado y adaptado a celular.

Paleta tomada del logo: azul marino y azul eléctrico, con acentos naranja/amarillo/rojo del globo.

## Estructura

```
index.html              Página única (estructura)
assets/css/styles.css   Estilos y paleta (variables en :root)
assets/js/config.js     ⭐ DATOS DEL NEGOCIO: contacto, redes, servicios, FAQ, cifras
assets/js/app.js        Lógica (cotizador, filtros, formularios, animaciones, tema)
assets/img/             Logo (transparente), favicon e imagen para redes
```

## Qué debe confirmar / completar (assets/js/config.js)

| Dato | Estado |
|------|--------|
| WhatsApp / teléfono `+506 8866 3352` | ✅ tomado del material gráfico |
| Correo `ventas@itbassettcr.com` | ✅ tomado del material gráfico |
| Facebook `BassettTecnologiaCR` | ✅ |
| **Dirección** (`direccion`, `mapaConsulta`) | ⚠️ pendiente — hoy dice «Costa Rica» |
| **Horario** (`horario`) | ⚠️ pendiente — hoy muestra «consulte por WhatsApp» |
| Instagram, TikTok, YouTube, LinkedIn (`redes`) | opcional — solo se muestran las que tengan URL |
| Textos de servicios y FAQ | redacción general: revísela y ajústela |
| «+25 años» y «ISO 9001» | tomados del material gráfico: confirme que la certificación esté vigente |

### Dirección y mapa
Escriba la dirección completa (o el nombre del local tal como aparece en Google Maps) en
`direccion` y `mapaConsulta`. El mapa y los botones *Cómo llegar* / *Waze* se actualizan solos.

### Precios en el cotizador (opcional)
Cada servicio tiene `desde: null`. Si define un precio base en colones por unidad
(p. ej. `desde: 25000`), el cotizador mostrará un **estimado referencial**. Mientras todos
estén en `null`, solo prepara la solicitud (sin precios).

### Recibir solicitudes por correo sin abrir el programa de correo (opcional)
Cree un formulario en un servicio como [Formspree](https://formspree.io), Getform o Web3Forms
y pegue su URL en `formEndpoint`. Aparecerá un botón *Enviar solicitud* en el cotizador y en el
formulario de contacto. Sin esto, el sitio usa WhatsApp y `mailto:`.

### Colores
Todos los colores están como variables CSS al inicio de `assets/css/styles.css`.

## Ver el sitio en su computadora

```bash
# opción 1: abrir index.html con el navegador
# opción 2: servidor local
npx http-server . -p 8080
```

## Publicarlo

Es un sitio estático: sirve cualquier hosting.

- **GitHub Pages:** *Settings → Pages → Deploy from a branch →* rama y carpeta `/ (root)`.
- **Netlify / Cloudflare Pages / Vercel:** conecte el repositorio (sin comando de build, carpeta raíz).
- **Hosting tradicional (cPanel):** suba todo el contenido del proyecto a `public_html`.

Si el dominio final es distinto de `www.itbassettcr.com`, actualice la URL en `index.html`
(`canonical`, `og:url`, `og:image`), `sitemap.xml`, `robots.txt` y `sitioWeb` en `config.js`.

## Logo

Los archivos de `assets/img/` se recortaron del flyer enviado (resolución limitada). Si dispone del
logo original en alta resolución (SVG/PNG), reemplace `logo-white.png` y `globe.png` por esas versiones.
