#!/usr/bin/env python3
"""Crea el .zip para subir a Netlify (index.html queda en la raíz del zip).

Uso:  python3 -I make_zip.py CARPETA_DEL_SITIO SALIDA.zip
Excluye .git, .claude, node_modules, README.md y otros .zip.
"""
import os
import sys
import zipfile
from pathlib import Path

if len(sys.argv) != 3:
    sys.exit(__doc__)
root, out = Path(sys.argv[1]).resolve(), Path(sys.argv[2]).resolve()
if not (root / "index.html").is_file():
    sys.exit("No hay index.html en la carpeta.")
SKIP_DIRS = {".git", ".claude", "node_modules"}
files = []
for d, dirs, fs in os.walk(root):
    dirs[:] = [x for x in dirs if x not in SKIP_DIRS]
    for f in fs:
        p = Path(d) / f
        if f.lower().endswith(".zip") or f == "README.md" or p == out:
            continue
        files.append(p.relative_to(root))
with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as z:
    for rel in sorted(files):
        z.write(root / rel, rel.as_posix())
print(f"{len(files)} archivos -> {out} ({out.stat().st_size // 1024} KB)")
