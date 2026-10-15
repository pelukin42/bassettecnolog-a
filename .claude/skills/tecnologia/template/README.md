# {{NOMBRE}} — Sitio web

Sitio web dinámico y 100 % estático (HTML + CSS + JavaScript, **sin instalación ni compilación**).

## Qué incluye
- Portada con fibra óptica animada (canvas), titular dinámico, cifras y marquesina de servicios.
- Servicios con filtro por categoría, foco de luz con el cursor, botones *Cotizar* y *WhatsApp*.
- **Red interactiva**: cada elemento (firewall, switch, Wi-Fi, PC, cámaras, impresoras…) muestra su servicio.
- **Comparador antes/después** de cableado estructurado (ilustración referencial).
- **Diagnóstico rápido** (problema → detalles → recomendación) con salida a WhatsApp o al cotizador.
- **Cotizador en línea** en 3 pasos (WhatsApp, correo o copiar resumen).
- Contacto con formulario, mapa (Google Maps / Waze), redes sociales, botón flotante de WhatsApp,
  preguntas frecuentes, modo claro/oscuro y SEO básico.

## Estructura
```
index.html              Estructura de la página
assets/css/styles.css   Estilos y paleta (variables en :root)
assets/js/config.js     ⭐ DATOS DEL NEGOCIO: contacto, redes, servicios, FAQ, diagnóstico, cifras
assets/js/app.js        Lógica
assets/js/visuals.js    Fibra óptica animada y rack antes/después
assets/img/             Logo, favicon e imagen para redes
_headers                Cabeceras de seguridad/caché para Netlify
```

## Pendiente por completar (assets/js/config.js)
- `direccion` y `mapaConsulta` · `horario` · redes sociales (`redes`)
- Revisar `servicios`, `faq` y `diagnostico`: son textos generales, adáptelos al negocio real.
- Reemplazar el logo (`assets/img/logo-white.png`, `globe.png`) si es provisional y regenerar `og-image.jpg`.

## Ver en local
```bash
npx http-server . -p 8080
```

## Publicar
Es estático: sirve Netlify (arrastrar la carpeta o el .zip), GitHub Pages, Cloudflare Pages o cualquier hosting.
Si el dominio final cambia, actualice `canonical`, `og:url`, `og:image` (index.html), `sitemap.xml`,
`robots.txt` y `sitioWeb` en `config.js`.
