#!/usr/bin/env python3
"""Sestaví web projektu do složky web/ (index.html + náhledy + obrázky).

Zdroje:
  src/index.html, src/css/*.css, src/js/*.js   aplikace (vloží se inline do jednoho HTML)
  src/vendor/*.js                               three.js, OrbitControls, marked
  docs/**/*.md                                  wiki (pořadí a názvy v WIKI níže)
  docs/dily/*/kandidati.md                      katalog produktů

Výstup web/ je samostatný: jde otevřít přímo z disku, nasadit na GitHub Pages nebo servírovat
přes tools/server.py.

Závislosti: Python 3.9+. Volitelně Pillow (náhledy) a numpy + scipy (ořezané ikonky dílů):
  pip install -r requirements.txt

Spuštění:  python tools/build.py
"""
from __future__ import annotations

import datetime
import hashlib
import json
import re
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "src"
DOCS = ROOT / "docs"
WEB = ROOT / "web"
THUMBS = WEB / "thumbs"
IMG_EXT = (".png", ".jpg", ".jpeg", ".webp", ".gif")

CSS = ["tokens", "base", "layout", "components", "wiki", "products", "viewer", "costing", "wiring", "calculators", "responsive"]
JS = ["core", "variants", "design", "drawings", "app", "wiki", "products", "viewer3d", "model", "bom", "costing", "wiring",
      "calculators", "settings", "main"]
VENDOR = ["three.min.js", "OrbitControls.js", "marked.min.js"]

# Kategorie katalogu dílů: složka v docs/dily -> (název, ikona)
CATS = {
    "hotova-reseni": ("Hotová řešení a moduly", "🧩"),
    "konstrukce": ("Konstrukce a rám", "🏗️"),
    "vedeni": ("Lineární vedení", "🛤️"),
    "prevody": ("Převody", "🔩"),
    "motory": ("Motory a drivery", "⚙️"),
    "vreteno": ("Vřeteno a měnič", "🌀"),
    "elektronika": ("Řízení a elektronika", "🔌"),
    "software": ("Software", "💻"),
    "prislusenstvi": ("Příslušenství a nástroje", "🧰"),
}

# Wiki: sekce -> stránky (soubor, ikona, název v menu). Název stránky v obsahu bere z nadpisu # v souboru.
WIKI = [
    ("Projekt", [
        ("README.md", "🏠", "Přehled"),
        ("navrh/nas-navrh.md", "⭐", "Custom1 a Custom2"),
        ("navrh/rozhodnuti.md", "🧭", "Rozhodnutí"),
        ("navrh/koncept-v2.md", "📐", "Koncept v2"),
        ("navrh/prototyp-v1.md", "🛠️", "Prototyp v1"),
    ]),
    ("Inspirace", [
        ("inspirace/favorit-ocelovy-portal.md", "🏆", "Ocelový portál"),
        ("inspirace/komunitni-projekty.md", "🌍", "Komunitní projekty"),
    ]),
    ("Díly a technologie", [
        ("dily/konstrukce/katalog.md", "🏗️", "Konstrukce a rám"),
        ("dily/vedeni/katalog.md", "🛤️", "Lineární vedení"),
        ("dily/prevody/katalog.md", "🔩", "Převody"),
        ("dily/motory/katalog.md", "⚙️", "Motory a drivery"),
        ("dily/vreteno/katalog.md", "🌀", "Vřeteno a měnič"),
        ("dily/elektronika/katalog.md", "🔌", "Řízení a elektronika"),
        ("dily/software/katalog.md", "💻", "Software"),
        ("dily/hotova-reseni/katalog.md", "🧩", "Hotové stroje a osy Z"),
        ("dily/prislusenstvi/nastroje-frezy.md", "🧰", "Nástroje a frézy"),
    ]),
]

# Ruční korekce, které se z textu nedají spolehlivě vyčíst (klíč = část URL nebo začátek názvu)
OVERRIDES = {
    "Ruční přesný posuvný stolek": {"price": 1601},
    "ROYI": {"price": 796},
    "V-Openbuilds gantry deska": {"price": 186},
    "TEHIGHAUTO Mini Precision": {"price": 1499},
    "SucceBuy SBR12/16/20": {"price": 2076},
    "Energetické (kabelové) řetězy": {"price": 110, "shipping": 0,
                                      "url": "https://techfun.cz/produkt/organizator-pro-kabelaz-retezovy/",
                                      "shop": "techfun.cz", "verdict": "top"},
}
# Galerie zapsané v citaci (blockquote) mimo vlastní sekci produktu
EXTRA_FOLDERS = {
    "OpenBuilds V-Slot lineární aktuátor s řemenem": ["obrazky/openbuilds-vslot-aktuator"],
    "Ruční přesný posuvný stolek 1D/2D": ["obrazky/manual-slide-table-yixindianqi"],
}

NUM = r"(\d{1,3}(?:[   ]\d{3})*(?:,\d+)?)"

try:
    from PIL import Image
except ImportError:
    Image = None
try:
    import numpy as np
    from scipy import ndimage
except ImportError:
    np = ndimage = None


# ---------------------------------------------------------------- pomocné
def to_num(s: str) -> float:
    return float(re.sub(r"[   ]", "", s).replace(",", "."))


def slug(s: str) -> str:
    s = s.lower().translate(str.maketrans("áčďéěíňóřšťúůýž", "acdeeinorstuuyz"))
    return re.sub(r"[^a-z0-9]+", "-", s).strip("-")[:60] or "x"


def asset(p: Path) -> str:
    """Zkopíruje soubor z docs/ do web/docs/ a vrátí cestu relativní k web/."""
    rel = p.relative_to(ROOT).as_posix()
    out = WEB / rel
    if not out.exists() or out.stat().st_mtime < p.stat().st_mtime:
        out.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(p, out)
    return rel


def doc_id(path: Path) -> str:
    return slug(path.relative_to(DOCS).as_posix().removesuffix(".md").removesuffix("/README"))


def rewrite_links(md: str, base: Path) -> str:
    """Relativní odkazy v markdownu: .md -> #wiki/<id>, obrázky -> web/docs/…"""
    def repl(m):
        bang, text, target = m.group(1), m.group(2), m.group(3).strip()
        if re.match(r"^(https?:|mailto:|#|data:)", target):
            return m.group(0)
        target, _, anchor = target.partition("#")
        p = (base / target).resolve()
        if p.suffix == ".md" and p.exists():
            return f"{bang}[{text}](#wiki/{doc_id(p)}{('/' + anchor) if anchor else ''})"
        if p.is_file():
            return f"{bang}[{text}]({asset(p)})"
        if p.is_dir():                          # složka s obrázky -> první obrázek nebo nic
            return text
        return m.group(0)
    return re.sub(r"(!?)\[([^\]]*)\]\(([^)]+)\)", repl, md)


# ---------------------------------------------------------------- náhledy
def thumb(img: Path) -> str:
    if Image is None:
        return asset(img)
    THUMBS.mkdir(parents=True, exist_ok=True)
    h = hashlib.md5(img.relative_to(ROOT).as_posix().encode()).hexdigest()[:12]
    out = THUMBS / f"{h}.jpg"
    if not out.exists() or out.stat().st_mtime < img.stat().st_mtime:
        try:
            im = Image.open(img).convert("RGB")
            im.thumbnail((520, 520))
            im.save(out, "JPEG", quality=78, optimize=True)
        except Exception as e:
            print("  ! náhled selhal:", img, e)
            return asset(img)
    return out.relative_to(WEB).as_posix()


def _mini_analyse(im):
    """Najde v obrázku nejlepší „fotku produktu“: pozadí = jednolité pixely spojené s okrajem,
    popředí se rozdělí na shluky a každý se ohodnotí (velikost, poloodstíny jako na fotce,
    málo textu a červených cenovek e-shopu). Vrací (skóre, maska pozadí, bbox)."""
    a = np.asarray(im, dtype=np.int16)
    h, w, _ = a.shape
    edge = np.concatenate([a[0], a[-1], a[:, 0], a[:, -1]])
    near = np.abs(a - np.median(edge, axis=0)).max(axis=2) < 22
    lab, _ = ndimage.label(near)
    border = list(set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0})
    bg = np.isin(lab, border)
    fg = ~bg
    if fg.sum() < 50:
        return -1, bg, None
    cl, _ = ndimage.label(ndimage.binary_dilation(fg, iterations=3))
    lum = a.mean(axis=2)
    spread = a.max(axis=2) - a.min(axis=2)
    red = (a[:, :, 0] > 170) & (a[:, :, 1] < 170) & (a[:, :, 2] < 120) & (a[:, :, 0] - a[:, :, 2] > 90)
    best = (-1, None)
    for k, sl in enumerate(ndimage.find_objects(cl), 1):
        if sl is None:
            continue
        ys, xs = sl
        bh, bw = ys.stop - ys.start, xs.stop - xs.start
        if bh < h * .18 or bw < w * .18 or not (0.35 < bw / bh < 2.8):
            continue
        m = (cl[sl] == k) & fg[sl]
        cnt = m.sum()
        if cnt < 80:
            continue
        L = lum[sl][m]
        mid = ((L > 45) & (L < 215)).mean()
        smooth = (spread[sl][m] < 90).mean()
        fill = cnt / (bh * bw)
        nraw = ndimage.label(m)[1]              # text = stovky drobných shluků, fotka = pár velkých
        sc = (min(1, bh * bw / (w * h * .22)) * mid * (0.5 + 0.5 * smooth) * max(0, 1 - 3 * red[sl][m].mean())
              * (0.3 + min(fill, .7)) / (1 + nraw / 7))
        if sc > best[0]:
            best = (sc, (xs.start, ys.start, xs.stop - 1, ys.stop - 1))
    return best[0], bg, best[1]


def mini(imgs) -> str:
    """Ikonka dílu do kalkulace: nejlepší fotka produktu, oříznutá, s průhledným pozadím (PNG 192×192)."""
    if Image is None or np is None or not imgs:
        return ""
    best, bs = None, -1
    for f in imgs:
        try:
            im = Image.open(f).convert("RGB")
            im.thumbnail((360, 360))
            sc = _mini_analyse(im)[0]
        except Exception:
            continue
        if sc > bs:
            best, bs = f, sc
    if best is None or bs < 0.05:
        return ""
    h = hashlib.md5(("mini6:" + best.relative_to(ROOT).as_posix()).encode()).hexdigest()[:12]
    out = THUMBS / f"m_{h}.png"
    if not (out.exists() and out.stat().st_mtime >= best.stat().st_mtime):
        THUMBS.mkdir(parents=True, exist_ok=True)
        im = Image.open(best).convert("RGB")
        im.thumbnail((480, 480))
        _, bg, bb = _mini_analyse(im)
        if bb is None:
            return ""
        rgba = np.dstack([np.asarray(im), np.where(bg, 0, 255).astype(np.uint8)])
        x0, y0, x1, y1 = bb
        crop = Image.fromarray(rgba[y0:y1 + 1, x0:x1 + 1], "RGBA")
        side = int(max(crop.size) * 1.08) + 2
        sq = Image.new("RGBA", (side, side), (255, 255, 255, 0))
        sq.paste(crop, ((side - crop.size[0]) // 2, (side - crop.size[1]) // 2))
        sq.resize((192, 192), Image.LANCZOS).save(out, "PNG", optimize=True)
    return out.relative_to(WEB).as_posix()


def cover_index(imgs) -> int:
    """Na kartu radši fotku produktu než široký screenshot celé stránky obchodu."""
    if Image is None or len(imgs) < 2:
        return 0
    for i, f in enumerate(imgs):
        try:
            w, h = Image.open(f).size
        except Exception:
            continue
        if 0.6 <= w / h <= 1.45:
            return i
    return 0


# ---------------------------------------------------------------- produkty
def folder_images(d: Path):
    return sorted([f for f in d.iterdir() if f.suffix.lower() in IMG_EXT], key=lambda f: (len(f.stem), f.stem))


def collect_images(lines, base: Path):
    imgs = []
    for ln in lines:
        if ln.lstrip().startswith(">"):
            continue
        for target in re.findall(r"\]\(([^)]+)\)", ln):
            if target.startswith("http"):
                continue
            p = (base / target).resolve()
            if p.is_dir():
                imgs += folder_images(p)
            elif p.suffix.lower() in IMG_EXT and p.exists():
                imgs.append(p)
    return list(dict.fromkeys(imgs))


def classify(title: str, verdict: str) -> str:
    t = verdict.lower()
    if "KOUPENO" in title or "OBJEDNÁNO" in title:
        return "koupeno"
    if "✅" in verdict or "hlavní kandidát" in t:
        return "top"
    if any(k in t for k in ["náhradník", "záložní", "záloha", "použitelné", "princip ano", "dobrý poměr",
                            "levné a smysluplné", "pro osu z (", "pro délku 1800", "koupit **techfun"]):
        return "maybe"
    if any(k in t for k in ["teď nekupovat", "zatím nekupovat", "koupit až", "nekupovat teď"]):
        return "later"
    if "nekupovat" in t:
        return "no"
    return "maybe"


def find_price(body_lines):
    price = shipping = None
    line = next((l for l in body_lines if "Cena" in l), "")
    m = re.search(r"\*\*~?" + NUM + r"\s*Kč", line) or re.search(NUM + r"\s*Kč", line)
    if m:
        price = to_num(m.group(1))
    for l in [line] + [x for x in body_lines if x.startswith("- ") and re.search(r"[Dd]oprava", x)]:
        m = re.search(r"[Dd]oprava\s*\**\s*(?:od\s+)?\**\s*" + NUM + r"\s*Kč", l)
        if m:
            return price, to_num(m.group(1))
        if re.search(r"[Dd]oprava zdarma", l):
            return price, 0
    return price, shipping


def parse_products(md_path: Path, only_first=False):
    cat = md_path.parent.name
    parts = re.split(r"(?m)^## ", md_path.read_text(encoding="utf-8"))[1:]
    if only_first:
        parts = parts[:1]
    prods = []
    for part in parts:
        lines = part.split("\n")
        title, body_lines = lines[0].strip(), lines[1:]
        body = re.sub(r"\n---\s*$", "", "\n".join(body_lines).strip()).strip()
        body_md = "\n".join(l for l in body.split("\n") if not l.lstrip().startswith("> Galerie"))

        m = re.search(r"(?m)^- Odkaz[^:]*:\s*(https?://\S+)", body)
        url = m.group(1) if m else ""
        host = re.sub(r"^https?://(www\.)?", "", url).split("/")[0] if url else ""
        shop = {"aliexpress.com": "AliExpress", "allegro.cz": "Allegro", "eur.vevor.com": "VEVOR"}.get(host, host)
        price, shipping = find_price(body_lines)

        verdict = ""
        for i, l in enumerate(body_lines):
            if "Předběžný verdikt" in l:
                verdict = l.split(":**", 1)[1].strip() if ":**" in l else next((x for x in body_lines[i + 1:] if x.strip()), "")
                break
        if not verdict and "KOUPENO" in title:
            verdict = "Koupeno – srovnávací fréza pro vřeteno s kleštinou ER16/ER20."

        low = body.lower()
        trust = "bad" if "nedůvěřuje" in low else "doubt" if "pochybnost" in low else "ok" if "důvěryhodný" in low or "důvěřuje" in low else ""

        imgs = collect_images(body_lines, md_path.parent)
        for key, folders in EXTRA_FOLDERS.items():
            if title.startswith(key):
                for f in folders:
                    if (md_path.parent / f).is_dir():
                        imgs += folder_images(md_path.parent / f)

        clean = re.sub(r"^[⭐✅\s]+", "", title)
        clean = re.sub(r"^(KOUPENO|OBJEDNÁNO[^:]*):\s*", "", clean)
        p = {
            "id": slug(clean), "cat": cat, "title": clean, "star": title.count("⭐"),
            "url": url, "shop": shop, "price": price, "shipping": shipping,
            "verdictText": re.sub(r"\*\*|__", "", verdict).strip(), "verdict": classify(title, verdict), "trust": trust,
            "images": [asset(i) for i in imgs], "thumbs": [thumb(i) for i in imgs],
            "cover": cover_index(imgs), "mini": mini(imgs),
            "md": rewrite_links(body_md, md_path.parent), "src": md_path.relative_to(ROOT).as_posix(),
        }
        for key, ov in OVERRIDES.items():
            if key in url or clean.startswith(key):
                p.update(ov)
        prods.append(p)
    return prods


# ---------------------------------------------------------------- sestavení
def read(p: Path) -> str:
    return p.read_text(encoding="utf-8")


def main():
    if WEB.exists():
        shutil.rmtree(WEB / "docs", ignore_errors=True)        # obrázky se kopírují znovu (smazané soubory nezůstanou)
    WEB.mkdir(exist_ok=True)

    products = []
    for d in sorted((DOCS / "dily").iterdir()):
        if (d / "kandidati.md").exists():
            products += parse_products(d / "kandidati.md")
    products += parse_products(DOCS / "dily/prislusenstvi/nastroje-frezy.md", only_first=True)
    seen = {}
    for p in products:
        if p["id"] in seen:
            seen[p["id"]] += 1
            p["id"] += f"-{seen[p['id']]}"
        else:
            seen[p["id"]] = 1

    wiki = []
    for group, pages in WIKI:
        for rel, icon, nav in pages:
            p = DOCS / rel
            if not p.exists():
                print("  ! chybí", rel)
                continue
            md = read(p)
            tm = re.search(r"(?m)^# (.+)$", md)
            wiki.append({"id": doc_id(p), "group": group, "icon": icon, "nav": nav,
                         "title": tm.group(1).strip() if tm else nav, "src": p.relative_to(ROOT).as_posix(),
                         "md": rewrite_links(md, p.parent)})

    data = {"generated": datetime.datetime.now().strftime("%d. %m. %Y %H:%M"),
            "cats": {k: {"name": v[0], "icon": v[1]} for k, v in CATS.items()},
            "products": products, "wiki": wiki}

    css = "\n".join(read(SRC / "css" / f"{n}.css") for n in CSS)
    js = "\n".join(read(SRC / "js" / f"{n}.js") for n in JS)
    vendor = "\n".join(read(SRC / "vendor" / n) for n in VENDOR).replace("</script", "<\\/script")
    payload = json.dumps(data, ensure_ascii=False).replace("</", "<\\/")
    html = read(SRC / "index.html")
    for key, val in [("<!-- @css -->", f"<style>\n{css}</style>"),
                     ("<!-- @vendor -->", f"<script>{vendor}</script>"),
                     ("<!-- @data -->", f"<script>const DATA = {payload};</script>"),
                     ("<!-- @js -->", f'<script>\n"use strict";\n{js}</script>')]:
        assert key in html, key
        html = html.replace(key, val)
    (WEB / "index.html").write_text(html, encoding="utf-8", newline="\n")
    (WEB / ".nojekyll").write_text("", encoding="utf-8")

    print(f"web/index.html: {len(html) / 1024:.0f} kB · produktů {len(products)} · wiki stránek {len(wiki)}")
    if "-v" in sys.argv:
        for p in products:
            print(f"  [{p['verdict']:7}] {str(p['price']):>7} + {str(p['shipping']):>6}  img:{len(p['images']):2}  {p['title'][:70]}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
