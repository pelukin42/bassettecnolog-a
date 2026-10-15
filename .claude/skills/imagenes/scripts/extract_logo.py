#!/usr/bin/env python3
"""Recorta el logo de Bassett Tecnología desde el flyer y lo deja con fondo transparente.

Uso:
  python3 -I extract_logo.py FLYER.png assets/img

Genera en la carpeta de salida: globe.png (globo circular) y logo-white.png
(globo + texto «bassett tecnología» en blanco). Las coordenadas son las del
flyer de 960x533 usado originalmente; si el flyer es otro, ajuste GLOBE y WORD.
Si existe el logo original en SVG/PNG de alta resolución, úselo en su lugar.
"""
import sys

import numpy as np
from PIL import Image, ImageDraw

GLOBE = (327, 104, 64)          # centro x, centro y, radio
WORD = (418, 52, 668, 148)      # caja del texto


def main(src_path, out):
    src = Image.open(src_path).convert("RGB")

    # Globo: recorte circular con borde suave
    cx, cy, r = GLOBE
    g = src.crop((cx - r - 2, cy - r - 2, cx + r + 2, cy + r + 2)).convert("RGBA")
    S = 4
    mask = Image.new("L", (g.width * S, g.height * S), 0)
    c = g.width * S / 2
    ImageDraw.Draw(mask).ellipse((c - r * S, c - r * S, c + r * S, c + r * S), fill=255)
    g.putalpha(mask.resize(g.size, Image.LANCZOS))
    g = g.resize((g.width * 3, g.height * 3), Image.LANCZOS)
    g.save(f"{out}/globe.png", optimize=True)

    # Texto blanco: el canal mínimo (RGB) de un pixel blanco es alto; el fondo azul no
    w = np.asarray(src.crop(WORD)).astype(float)
    alpha = np.clip((w.min(axis=2) - 110) / (215 - 110), 0, 1)
    rgba = np.zeros((*alpha.shape, 4), dtype=np.uint8)
    rgba[..., :3] = 255
    rgba[..., 3] = (alpha * 255).astype(np.uint8)
    wm = Image.fromarray(rgba, "RGBA")
    wm = wm.crop(wm.getbbox())
    wm = wm.resize((wm.width * 3, wm.height * 3), Image.LANCZOS)

    gap = 30
    lock = Image.new("RGBA", (g.width + gap + wm.width, g.height), (0, 0, 0, 0))
    lock.paste(g, (0, 0), g)
    lock.paste(wm, (g.width + gap, (g.height - wm.height) // 2), wm)
    lock.save(f"{out}/logo-white.png", optimize=True)
    print("ok:", f"{out}/globe.png", f"{out}/logo-white.png")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    main(sys.argv[1], sys.argv[2])
