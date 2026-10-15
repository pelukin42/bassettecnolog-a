#!/usr/bin/env python3
"""Optimiza imágenes descargadas para la web (redimensiona y comprime).

Uso:
  python3 -I optimize.py ENTRADA SALIDA [--max 1600] [--quality 80] [--format webp|jpg]

ENTRADA puede ser un archivo o una carpeta; SALIDA es la carpeta destino
(normalmente assets/img). Conserva el nombre base y cambia la extensión.
"""
import argparse
import sys
from pathlib import Path

from PIL import Image

EXTS = {".png", ".jpg", ".jpeg", ".webp"}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("entrada")
    ap.add_argument("salida")
    ap.add_argument("--max", type=int, default=1600, help="ancho máximo en px (def. 1600)")
    ap.add_argument("--quality", type=int, default=80)
    ap.add_argument("--format", choices=["webp", "jpg"], default="webp")
    a = ap.parse_args()

    src = Path(a.entrada)
    files = [src] if src.is_file() else sorted(p for p in src.iterdir() if p.suffix.lower() in EXTS)
    if not files:
        sys.exit("No hay imágenes en la entrada.")
    out = Path(a.salida)
    out.mkdir(parents=True, exist_ok=True)

    for f in files:
        im = Image.open(f)
        im = im.convert("RGB")
        if im.width > a.max:
            im = im.resize((a.max, round(im.height * a.max / im.width)), Image.LANCZOS)
        dest = out / (f.stem + (".webp" if a.format == "webp" else ".jpg"))
        if a.format == "webp":
            im.save(dest, "WEBP", quality=a.quality, method=6)
        else:
            im.save(dest, "JPEG", quality=a.quality, optimize=True, progressive=True)
        print(f"{f.name} -> {dest}  {im.width}x{im.height}  {dest.stat().st_size // 1024} KB")


if __name__ == "__main__":
    main()
