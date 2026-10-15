#!/usr/bin/env python3
"""Prepara la página para publicarla como Artifact (vista previa privada en claude.ai).

El Artifact envuelve el archivo en su propia estructura <html>, así que se quitan <html>/<head>/<body>,
metas y favicon, y se pone un título corto.

Uso:  python3 -I preview_html.py CARPETA_DEL_SITIO SALIDA.html "Nombre corto"
Después publique SALIDA.html con la herramienta Artifact y pase en `files`:
  assets/css/styles.css, assets/js/config.js, assets/js/app.js, assets/js/visuals.js,
  assets/img/logo-white.png, assets/img/globe.png   (con `root` = CARPETA_DEL_SITIO)
Nota: el mapa incrustado y algunos enlaces (mailto/wa.me) no funcionan dentro del visor.
"""
import re
import sys
from pathlib import Path

if len(sys.argv) != 4:
    sys.exit(__doc__)
site, out, title = Path(sys.argv[1]), Path(sys.argv[2]), sys.argv[3]
s = (site / "index.html").read_text(encoding="utf-8")
head = re.search(r"<head>(.*?)</head>", s, re.S).group(1)
body = re.search(r"<body>(.*?)</body>", s, re.S).group(1)
kept = []
for block in re.split(r"(?<=>)\s*\n", head):
    b = block.strip()
    if not b or re.match(r"<(meta|title)\b", b) or re.match(r'<link rel="(canonical|icon|apple-touch-icon)"', b):
        continue
    kept.append(block)
out.write_text(f"<title>{title}</title>\n" + "\n".join(kept).strip() + "\n" + body, encoding="utf-8")
print("ok ->", out)
