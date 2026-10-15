# Prompts listos para Higgsfield (Bassett Tecnología)

Modelo: `gpt_image_2_5`, `quality: medium`. Todos terminan con: *no text, no logos, no watermark*.
Estilo común: fotorrealista, gradación azul marino profundo, luz cian/azul eléctrico con un acento cálido naranja.

| # | Archivo | Uso en el sitio | Formato | Res. |
|---|---------|-----------------|---------|------|
| 0 | `hero-fibra.webp` | `imagenes.heroFondo` | 16:9 | 2k |
| 1 | `rack-desordenado.webp` | `imagenes.cableadoAntes` | 4:3 → recorte 16:10 | 1k |
| 1b | `rack-ordenado.webp` | `imagenes.cableadoDespues` | edición del #1 | 1k |
| 2 | `camara-cctv.webp` | `servicios[camaras].imagen` | 4:3 | 1k |
| 3 | `datacenter.webp` | banner ancho / sección Nosotros | 21:9 | 2k |
| 4 | `tecnico.webp` | sección Nosotros | 4:5 | 1k |
| 5 | `copiadora.webp` | `servicios[impresoras].imagen` / `fotocopiadoras` | 4:3 | 1k |
| 6 | `pc-interior.webp` | `servicios[pc].imagen` | 4:3 | 1k |
| 7 | `cableado-rj45.webp` | `servicios[cableado].imagen` | 4:3 | 1k |
| 8 | `access-point.webp` | `servicios[redes].imagen` | 4:3 | 1k |

## Prompts

**0 · Portada — fibra óptica**
> Macro photograph of hundreds of glowing fiber optic strands sweeping diagonally across the frame in a dark room, deep navy blue background, electric blue and cyan light with a few warm orange and amber highlights at the tips, shallow depth of field, cinematic color grade, photorealistic, no text, no logos, no watermark

**1 · Rack desordenado (ANTES)**
> Front view of a 19-inch network equipment rack in a small server closet, centered, with a patch panel and a network switch, but with a chaotic mess of tangled, unlabeled multicolored ethernet cables hanging in a knot, poor cable management, harsh overhead light, photorealistic, documentary photo, no text, no logos, no watermark

**1b · Rack ordenado (DESPUÉS)** — edición con la imagen #1 como `image_references`
> Same rack, same camera angle and framing, same patch panel and switch, but now with professional structured cabling: short blue ethernet patch cables neatly routed through horizontal cable managers, grouped with orange velcro straps, each cable labeled, clean and organized, cool blue LED lighting, photorealistic, no readable text, no logos, no watermark

**2 · Cámara de seguridad**
> Modern white dome security CCTV camera mounted on the corner of a contemporary office building facade at blue hour dusk, deep navy sky, soft bokeh city lights, subtle cyan rim light and a warm orange glow in the background, photorealistic, cinematic, no text, no logos, no watermark

**3 · Pasillo de data center** (21:9, 2k)
> Wide cinematic view down a data center aisle between server racks, rows of small blue and cyan LED lights receding to a vanishing point, polished floor reflections, deep navy color grade with a faint orange light at the far end, photorealistic, no people, no text, no logos, no watermark

**4 · Técnico de TI** (4:5)
> Professional IT technician in a dark casual uniform polo and safety lanyard, holding a tablet and checking a network rack in a server room, lit by cool blue LED light with warm orange accent, friendly confident expression, shallow depth of field, photorealistic, no text on clothing, no logos, no watermark

**5 · Impresora / fotocopiadora multifuncional**
> Modern multifunction office printer and photocopier in a bright contemporary office, clean white machine with a color touchscreen, stacks of paper beside it, soft daylight, deep blue accent wall in the background, photorealistic, no text, no logos, no brand names, no watermark

**6 · Interior de PC / laptop**
> Close-up of the inside of a desktop PC and laptop motherboard with glowing blue and cyan LED lighting, circuit board details, RAM modules and an SSD, dark background, shallow depth of field, a hint of orange reflected light, photorealistic, no text, no logos, no watermark

**7 · Cableado RJ45**
> Extreme close-up of blue ethernet RJ45 cables plugged into a patch panel, neatly labeled and organized, glowing green and amber port LEDs, shallow depth of field, deep navy blue color grade, photorealistic, no readable text, no logos, no watermark

**8 · Access point Wi-Fi**
> White Wi-Fi access point mounted on the ceiling of a modern open-plan office, subtle blue status LED, minimalist architecture, soft light, desks and monitors blurred below, deep blue and cyan color grade with a touch of warm orange light, photorealistic, no text, no logos, no watermark

## Notas

- Las imágenes #1/#1b son comparables solo si la composición coincide: por eso #1b se genera como edición de #1.
- Si el resultado trae texto o marcas visibles, vuelva a generar con el prompt reforzado (`absolutely no text, letters or logos anywhere`).
- Rotular siempre como "Ilustración referencial" cuando se usen en un comparador o galería.
