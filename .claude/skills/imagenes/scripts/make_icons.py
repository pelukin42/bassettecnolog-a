#!/usr/bin/env python3
"""Genera favicon, apple-touch-icon e imagen para redes (og-image.jpg).

Uso (desde la raíz del proyecto):
  python3 -I .claude/skills/imagenes/scripts/make_icons.py assets/img

Requiere globe.png y logo-white.png en la carpeta (ver extract_logo.py).
"""
import glob
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFont


def main(d):
    g = Image.open(f"{d}/globe.png").convert("RGBA")

    for size, name, pad in ((64, "favicon-64.png", 1.0), (180, "apple-touch-icon.png", 0.86)):
        bg = Image.new("RGBA", (size, size), (0, 0, 0, 0) if pad == 1.0 else (6, 18, 57, 255))
        s = int(size * pad)
        gg = g.resize((s, s), Image.LANCZOS)
        bg.paste(gg, ((size - s) // 2, (size - s) // 2), gg)
        bg.save(f"{d}/{name}", optimize=True)

    # Open Graph 1200x630: degradado azul marino + bandas de luz + logo + lema
    W, H = 1200, 630
    yy, xx = np.mgrid[0:H, 0:W]
    t = xx / W * 0.5 + yy / H * 0.5
    c1, c2 = np.array([10, 29, 92]), np.array([3, 10, 36])
    base = c1 * (1 - t[..., None]) + c2 * t[..., None]
    for off, wid, col, k in ((70, 70, (20, 90, 230), 0.7), (470, 50, (40, 120, 255), 0.55)):
        band = np.clip(1 - np.abs((yy - 0.42 * xx - off) / wid), 0, 1) ** 1.5
        base += band[..., None] * np.array(col) * k
    img = Image.fromarray(np.clip(base, 0, 255).astype(np.uint8)).convert("RGBA")

    logo = Image.open(f"{d}/logo-white.png").convert("RGBA")
    lw = 640
    logo = logo.resize((lw, int(logo.height * lw / logo.width)), Image.LANCZOS)
    img.paste(logo, ((W - lw) // 2, 130), logo)

    fonts = glob.glob("/usr/share/fonts/**/DejaVuSans-Bold.ttf", recursive=True) or glob.glob("/usr/share/fonts/**/*Bold*.ttf", recursive=True)
    if fonts:
        draw = ImageDraw.Draw(img)
        for text, y, size, col in (
            ("Venta, instalación, reparación y mantenimiento", 410, 36, (255, 255, 255)),
            ("Computadoras · Redes · Cámaras · Impresoras · Soporte", 470, 28, (150, 190, 255)),
            ("www.itbassettcr.com", 545, 30, (255, 190, 90)),
        ):
            f = ImageFont.truetype(fonts[0], size)
            draw.text(((W - draw.textlength(text, font=f)) / 2, y), text, fill=col + (255,), font=f)
    img.convert("RGB").save(f"{d}/og-image.jpg", quality=88, optimize=True)
    print("ok: favicon-64.png, apple-touch-icon.png, og-image.jpg")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    main(sys.argv[1])
