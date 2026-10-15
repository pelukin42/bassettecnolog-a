#!/usr/bin/env python3
"""Genera un sitio web nuevo (negocio de tecnología / soporte técnico) a partir de la plantilla.

Uso mínimo:
  python3 -I scaffold.py --out ../mi-sitio --nombre "Acme Tech" --dominio acme.cr \
      --whatsapp 50688880000 --telefono "+506 8888 0000" --correo ventas@acme.cr

Opciones:
  --url URL            URL completa del sitio (def.: https://www.<dominio>)
  --direccion TXT      Dirección / referencia para el mapa (def.: el país)
  --pais "Costa Rica" --pais-iso CR --locale es-CR --moneda "₡"
  --facebook/--instagram/--tiktok/--youtube/--linkedin URL   (vacío = se oculta)
  --anios N            Muestra «+N años de experiencia» (omitir = no se muestra)
  --iso                Muestra la insignia y textos de «certificación ISO 9001»
  --paleta azul|turquesa|verde|morado|magenta|rojo|<tono 0-360>   Cambia la familia de azules
  --logo PNG           Logo horizontal con fondo transparente (se usa en cabecera y pie)
  --logo-blanco        Convierte el logo a silueta blanca (para fondos oscuros)
  --icono PNG          Ícono cuadrado (globo de la portada, favicon). Si falta, se genera con las iniciales
  --force              Permite escribir en una carpeta que ya existe

Sin --logo se genera un logo provisional con el nombre: reemplácelo por el real.
"""
import argparse
import colorsys
import datetime
import glob
import html
import re
import shutil
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont

TEMPLATE = Path(__file__).resolve().parent.parent / "template"
BASE_HUE = 222  # tono de los azules de la plantilla
PALETAS = {"azul": 222, "turquesa": 185, "verde": 150, "morado": 265, "magenta": 320, "rojo": 355}
TEXT_EXT = {".html", ".css", ".js", ".txt", ".xml", ".md"}


# ---------------------------------------------------------------- utilidades
def die(msg):
    sys.exit(f"ERROR: {msg}")


def cond(text, name, keep):
    """Bloques opcionales <!--NAME-->…<!--/NAME--> o /*NAME*/…/*/NAME*/."""
    pat = re.compile(r"(?:<!--|/\*)" + name + r"(?:-->|\*/)(.*?)(?:<!--|/\*)/" + name + r"(?:-->|\*/)", re.S)
    return pat.sub((lambda m: m.group(1)) if keep else "", text)


def esc_for(ext, value):
    if ext in (".js",):
        return value.replace("\\", "\\\\").replace("'", "\\'")
    if ext in (".html", ".xml"):
        return html.escape(value, quote=True)
    return value


def shift_rgb(r, g, b, dh):
    h, l, s = colorsys.rgb_to_hls(r / 255, g / 255, b / 255)
    deg = h * 360
    if 195 <= deg <= 262 and s > 0.2:
        r2, g2, b2 = colorsys.hls_to_rgb((h + dh) % 1.0, l, s)
        return round(r2 * 255), round(g2 * 255), round(b2 * 255)
    return r, g, b


def recolor(text, target):
    """Rota solo los colores de la familia azul (tono 195–262°); blancos, grises y acentos no cambian."""
    dh = (target - BASE_HUE) / 360.0

    def hexsub(m):
        v = m.group(1)
        r, g, b = shift_rgb(int(v[0:2], 16), int(v[2:4], 16), int(v[4:6], 16), dh)
        return f"#{r:02x}{g:02x}{b:02x}"

    def rgbsub(m):
        r, g, b = shift_rgb(int(m.group(2)), int(m.group(3)), int(m.group(4)), dh)
        return f"{m.group(1)}{r}, {g}, {b}"

    text = re.sub(r"#([0-9a-fA-F]{6})\b", hexsub, text)
    return re.sub(r"(rgba?\()\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})", rgbsub, text)


def font(size):
    for pat in ("/usr/share/fonts/**/DejaVuSans-Bold.ttf", "/usr/share/fonts/**/*Bold*.ttf", "/usr/share/fonts/**/*.ttf"):
        found = glob.glob(pat, recursive=True)
        if found:
            return ImageFont.truetype(found[0], size)
    return ImageFont.load_default()


def initials(name):
    words = [w for w in re.split(r"\W+", name) if w]
    return ("".join(w[0] for w in words[:2]) or name[:2]).upper()


# ---------------------------------------------------------------- imágenes
def make_icon(name, hue, size=396):
    """Globo provisional con degradado de la paleta e iniciales."""
    yy, xx = np.mgrid[0:size, 0:size]
    d = np.hypot(xx - size * 0.38, yy - size * 0.34) / (size * 0.75)
    d = np.clip(d, 0, 1)
    lo = np.array(colorsys.hls_to_rgb(hue / 360, 0.66, 0.9)) * 255
    hi = np.array(colorsys.hls_to_rgb(hue / 360, 0.22, 0.85)) * 255
    rgb = lo * (1 - d[..., None]) + hi * d[..., None]
    img = Image.fromarray(rgb.astype(np.uint8)).convert("RGBA")
    dr = ImageDraw.Draw(img)
    for i, (w, col) in enumerate(((10, (255, 255, 255, 235)), (8, (255, 199, 44, 255)), (6, (255, 138, 31, 255)))):
        inset = 40 + i * 34
        dr.arc((inset, size * 0.18 + i * 14, size - inset, size * 0.82 - i * 14), 200, 340, fill=col, width=w)
    f = font(int(size * 0.34))
    t = initials(name)
    tw = dr.textlength(t, font=f)
    dr.text(((size - tw) / 2, size * 0.40), t, fill=(255, 255, 255, 255), font=f)
    S = 4
    mask = Image.new("L", (size * S, size * S), 0)
    ImageDraw.Draw(mask).ellipse((2 * S, 2 * S, (size - 2) * S, (size - 2) * S), fill=255)
    img.putalpha(mask.resize((size, size), Image.LANCZOS))
    return img


def make_lockup(name, icon):
    """Icono + nombre en blanco, sobre transparente."""
    size = 150
    f = font(size)
    tmp = ImageDraw.Draw(Image.new("RGBA", (10, 10)))
    tw = tmp.textlength(name, font=f)
    if tw > 1300:
        size = int(size * 1300 / tw)
        f = font(size)
        tw = tmp.textlength(name, font=f)
    gap = 36
    H = icon.height
    out = Image.new("RGBA", (icon.width + gap + int(tw) + 8, H), (0, 0, 0, 0))
    out.paste(icon, (0, 0), icon)
    ImageDraw.Draw(out).text((icon.width + gap, (H - size * 1.15) / 2), name, fill=(255, 255, 255, 255), font=f)
    return out


def prep_logo(path, white):
    im = Image.open(path).convert("RGBA")
    if im.getchannel("A").getextrema()[0] == 255:
        print("AVISO: el logo no tiene fondo transparente; se verá un recuadro. Use un PNG transparente.")
    bbox = im.getchannel("A").getbbox()
    if bbox:
        im = im.crop(bbox)
    if white:
        a = im.getchannel("A")
        im = Image.new("RGBA", im.size, (255, 255, 255, 0))
        im.putalpha(a)
        solid = Image.new("RGBA", im.size, (255, 255, 255, 255))
        solid.putalpha(a)
        im = solid
    if im.height > 400:
        im = im.resize((round(im.width * 400 / im.height), 400), Image.LANCZOS)
    return im


def make_og(out, name, host, hue, icon_path_logo):
    W, H = 1200, 630
    yy, xx = np.mgrid[0:H, 0:W]
    t = xx / W * 0.5 + yy / H * 0.5
    dh = (hue - BASE_HUE) / 360
    c1 = np.array(shift_rgb(10, 29, 92, dh), float)
    c2 = np.array(shift_rgb(3, 10, 36, dh), float)
    base = c1 * (1 - t[..., None]) + c2 * t[..., None]
    for off, wid, col, k in ((70, 70, (20, 90, 230), 0.7), (470, 50, (40, 120, 255), 0.55)):
        band = np.clip(1 - np.abs((yy - 0.42 * xx - off) / wid), 0, 1) ** 1.5
        base += band[..., None] * np.array(shift_rgb(*col, dh)) * k
    img = Image.fromarray(np.clip(base, 0, 255).astype(np.uint8)).convert("RGBA")
    logo = Image.open(icon_path_logo).convert("RGBA")
    lw = min(640, W - 160)
    logo = logo.resize((lw, int(logo.height * lw / logo.width)), Image.LANCZOS)
    img.paste(logo, ((W - lw) // 2, 120), logo)
    d = ImageDraw.Draw(img)
    for text, y, size, col in (
        ("Venta, instalación, reparación y mantenimiento", 410, 36, (255, 255, 255)),
        ("Computadoras · Redes · Cámaras · Impresoras · Soporte", 470, 28, (150, 190, 255)),
        (host, 545, 30, (255, 190, 90)),
    ):
        f = font(size)
        d.text(((W - d.textlength(text, font=f)) / 2, y), text, fill=col + (255,), font=f)
    img.convert("RGB").save(out, quality=88, optimize=True)


def build_images(out, a, hue, host):
    img = out / "assets" / "img"
    img.mkdir(parents=True, exist_ok=True)
    if a.icono:
        icon = Image.open(a.icono).convert("RGBA")
        side = min(icon.size)
        icon = icon.crop(((icon.width - side) // 2, (icon.height - side) // 2, (icon.width + side) // 2, (icon.height + side) // 2)).resize((396, 396), Image.LANCZOS)
    else:
        icon = make_icon(a.nombre, hue)
    icon.save(img / "globe.png", optimize=True)
    logo = prep_logo(a.logo, a.logo_blanco) if a.logo else make_lockup(a.nombre, icon)
    logo.save(img / "logo-white.png", optimize=True)

    fav = icon.resize((64, 64), Image.LANCZOS)
    fav.save(img / "favicon-64.png", optimize=True)
    bg = Image.new("RGBA", (180, 180), (6, 18, 57, 255))
    g = icon.resize((155, 155), Image.LANCZOS)
    bg.paste(g, (12, 12), g)
    bg.save(img / "apple-touch-icon.png", optimize=True)
    make_og(img / "og-image.jpg", a.nombre, host, hue, img / "logo-white.png")
    return logo.size


# ---------------------------------------------------------------- principal
def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--out", required=True)
    p.add_argument("--nombre", required=True)
    p.add_argument("--dominio", required=True)
    p.add_argument("--whatsapp", required=True, help="código de país + número, solo dígitos")
    p.add_argument("--telefono", required=True)
    p.add_argument("--correo", required=True)
    p.add_argument("--url")
    p.add_argument("--direccion")
    p.add_argument("--pais", default="Costa Rica")
    p.add_argument("--pais-iso", default="CR")
    p.add_argument("--locale", default="es-CR")
    p.add_argument("--moneda", default="₡")
    for n in ("facebook", "instagram", "tiktok", "youtube", "linkedin"):
        p.add_argument(f"--{n}", default="")
    p.add_argument("--anios", type=int)
    p.add_argument("--iso", action="store_true")
    p.add_argument("--paleta", default="azul")
    p.add_argument("--logo")
    p.add_argument("--logo-blanco", action="store_true")
    p.add_argument("--icono")
    p.add_argument("--force", action="store_true")
    a = p.parse_args()

    wa = re.sub(r"\D", "", a.whatsapp)
    if len(wa) < 8:
        die("--whatsapp debe incluir código de país y número, solo dígitos (p. ej. 50688880000).")
    if not re.fullmatch(r"[^\s@]+@[^\s@]+\.[^\s@]+", a.correo):
        die("--correo no parece un correo válido.")
    host = re.sub(r"^https?://", "", a.dominio).strip("/")
    host = host[4:] if host.startswith("www.") else host
    url = (a.url or f"https://www.{host}").rstrip("/")
    shown_host = re.sub(r"^https?://", "", url)
    pal = a.paleta.lower()
    hue = PALETAS.get(pal) if pal in PALETAS else (float(pal) if re.fullmatch(r"\d{1,3}(\.\d+)?", pal) else None)
    if hue is None or not 0 <= hue <= 360:
        die(f"--paleta debe ser {', '.join(PALETAS)} o un tono 0-360.")

    out = Path(a.out).resolve()
    if out.exists() and any(out.iterdir()) and not a.force:
        die(f"{out} ya existe y no está vacía (use --force).")
    if not TEMPLATE.is_dir():
        die(f"No se encontró la plantilla en {TEMPLATE}")

    shutil.copytree(TEMPLATE, out, dirs_exist_ok=True)
    logo_w, logo_h = build_images(out, a, hue, shown_host)

    tokens = {
        "NOMBRE": a.nombre, "URL": url, "HOST": shown_host, "WHATSAPP": wa, "TELEFONO": a.telefono, "CORREO": a.correo,
        "DIRECCION": a.direccion or a.pais, "PAIS": a.pais, "PAIS_ISO": a.pais_iso, "LOCALE": a.locale,
        "LOCALE_US": a.locale.replace("-", "_"), "MONEDA": a.moneda,
        "FACEBOOK": a.facebook, "INSTAGRAM": a.instagram, "TIKTOK": a.tiktok, "YOUTUBE": a.youtube, "LINKEDIN": a.linkedin,
        "ANIOS": str(a.anios or ""), "LOGO_W": str(logo_w), "LOGO_H": str(logo_h),
        "FECHA": datetime.date.today().isoformat(),
    }
    has_years = bool(a.anios)
    for f in out.rglob("*"):
        if not f.is_file() or f.suffix.lower() not in TEXT_EXT:
            continue
        t = f.read_text(encoding="utf-8")
        t = cond(t, "EXPERIENCIA", has_years or a.iso)
        t = cond(t, "ANIOS", has_years)
        t = cond(t, "ISO", a.iso)
        for k, v in tokens.items():
            t = t.replace("{{" + k + "}}", esc_for(f.suffix.lower(), v))
        if f.suffix.lower() == ".js":
            t = re.sub(r"\n {5,}(?=\{ )", "\n    ", t)
        if hue != BASE_HUE and f.suffix.lower() in (".css", ".js", ".html"):
            t = recolor(t, hue)
        f.write_text(t, encoding="utf-8")

    left = [str(f.relative_to(out)) for f in out.rglob("*") if f.is_file() and f.suffix.lower() in TEXT_EXT and "{{" in f.read_text(encoding="utf-8")]
    if left:
        die("Quedaron variables sin reemplazar en: " + ", ".join(left))

    print(f"\n✔ Sitio generado en {out}")
    print(f"  Nombre: {a.nombre} · URL: {url} · Paleta: {pal} · Logo: {'proporcionado' if a.logo else 'PROVISIONAL'}")
    print("\nPendiente de revisar (assets/js/config.js):")
    print("  - direccion / mapaConsulta" + ("" if a.direccion else "  ← usa solo el país"))
    print("  - horario (vacío = «consulte por WhatsApp»)")
    print("  - redes sociales sin URL se ocultan")
    print("  - servicios, descripciones, FAQ y diagnóstico: adáptelos al negocio real")
    print("  - no hay testimonios, precios ni clientes inventados: no los agregue sin datos reales")


if __name__ == "__main__":
    main()
