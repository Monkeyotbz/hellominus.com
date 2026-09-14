#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
vectorize_logo.py - Traza a vector (SVG) el logo PNG de Turismo Colombia.

Flujo:
  1. Carga el PNG con Pillow (RGBA).
  2. Recorta el borde transparente y agrega un margen proporcional.
  3. (Opcional, por defecto ON) "pega" cada pixel al color de marca mas cercano
     -> regiones planas y limpias, sin ruido de compresion ni degradados.
  4. Traza con vtracer (wheel de pip con binario Rust incluido) -> SVG a color.
  5. (Opcional) genera ademas una silueta monocroma <name>-mono.svg para
     watermark / iconos / version de un solo color.

Uso:
    pip install vtracer pillow numpy
    python scripts/vectorize_logo.py                 # usa public/brand/logo-primary.png
    python scripts/vectorize_logo.py --install       # instala vtracer si falta
    python scripts/vectorize_logo.py otra.png -o otra.svg --faithful
    python scripts/vectorize_logo.py --silhouette

Nota honesta: un autotrace NO reemplaza el SVG maestro del disenador. El texto
del logo sale como manchas irregulares. Esto es un respaldo escalable mientras
se consigue el vectorial original (SVG/AI) desde el panel de GoDaddy.
"""
from __future__ import annotations

import argparse
import subprocess
import sys
import tempfile
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
DEFAULT_IN = REPO / "public" / "brand" / "logo-primary.png"

# Paleta de marca -- ver public/brand/BRANDING.md (hex reales del logo)
BRAND_PALETTE: dict[str, tuple[int, int, int]] = {
    "azul":         (0x0A, 0x3F, 0xD1),
    "oro_bright":   (0xF2, 0xC4, 0x00),
    "carmin_bright": (0xE1, 0x1B, 0x1B),
    "ink":          (0x1C, 0x1A, 0x17),
    "white":        (0xFF, 0xFF, 0xFF),
}


def die(msg: str, code: int = 1) -> None:
    print(f"error: {msg}", file=sys.stderr)
    raise SystemExit(code)


def ensure_vtracer(auto_install: bool) -> None:
    try:
        import vtracer  # noqa: F401
        return
    except ModuleNotFoundError:
        pass
    if not auto_install:
        die("falta 'vtracer'. Instalalo con:\n"
            "    pip install vtracer\n"
            "  o vuelve a correr este script con --install")
    print("instalando vtracer ...", file=sys.stderr)
    subprocess.check_call(
        [sys.executable, "-m", "pip", "install", "--quiet", "vtracer"]
    )


def load_rgba(path: Path):
    from PIL import Image
    if not path.exists():
        die(f"no existe la imagen de entrada: {path}")
    return Image.open(path).convert("RGBA")


def trim_and_pad(img, pad_frac: float, do_trim: bool):
    """Recorta el borde totalmente transparente y agrega margen proporcional."""
    from PIL import Image
    if do_trim:
        bbox = img.getchannel("A").getbbox()
        if bbox:
            img = img.crop(bbox)
    if pad_frac > 0:
        pad = max(2, round(max(img.size) * pad_frac))
        canvas = Image.new("RGBA", (img.width + 2 * pad, img.height + 2 * pad), (0, 0, 0, 0))
        canvas.paste(img, (pad, pad))
        img = canvas
    return img


def snap_to_palette(img, palette: dict, alpha_cutoff: int):
    """Mapea cada pixel opaco al color de paleta mas cercano (distancia RGB^2)."""
    import numpy as np
    arr = np.asarray(img, dtype=np.int16)            # (h, w, 4)
    rgb = arr[:, :, :3]
    alpha = arr[:, :, 3]
    pal = np.array(list(palette.values()), dtype=np.int16)   # (k, 3)

    # distancia^2 de cada pixel a cada color de la paleta
    diff = rgb[:, :, None, :] - pal[None, None, :, :]        # (h, w, k, 3)
    dist2 = (diff * diff).sum(axis=3)                        # (h, w, k)
    idx = dist2.argmin(axis=2)                               # (h, w)

    out = np.zeros_like(arr, dtype=np.uint8)
    out[:, :, :3] = pal[idx]
    opaque = alpha >= alpha_cutoff
    out[:, :, 3] = np.where(opaque, 255, 0).astype(np.uint8)
    # limpia el RGB de los pixeles transparentes para que vtracer no invente bordes
    out[~opaque] = (0, 0, 0, 0)

    from PIL import Image
    return Image.fromarray(out, "RGBA")


def make_silhouette(img, alpha_cutoff: int):
    """Todo lo opaco -> negro; el resto -> blanco. RGB plano para trazar en binario."""
    import numpy as np
    from PIL import Image
    arr = np.asarray(img)
    opaque = arr[:, :, 3] >= alpha_cutoff
    out = np.full((*opaque.shape, 3), 255, dtype=np.uint8)
    out[opaque] = (0, 0, 0)
    return Image.fromarray(out, "RGB")


def _hex_to_rgb(h: str) -> tuple[int, int, int]:
    h = h.lstrip("#")
    if len(h) == 3:
        h = "".join(c * 2 for c in h)
    return int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)


def snap_svg_fills(svg_path: Path, palette: dict) -> None:
    """Reescribe cada fill="#rrggbb" del SVG al color de marca mas cercano.

    vtracer genera pasos intermedios de color en los bordes (antialiasing);
    esto los colapsa a los hex exactos de la paleta.
    """
    import re
    pal = list(palette.values())
    txt = svg_path.read_text(encoding="utf-8")

    def nearest(m: "re.Match") -> str:
        r, g, b = _hex_to_rgb(m.group(1))
        cr, cg, cb = min(pal, key=lambda c: (c[0] - r) ** 2 + (c[1] - g) ** 2 + (c[2] - b) ** 2)
        return f'fill="#{cr:02X}{cg:02X}{cb:02X}"'

    txt = re.sub(r'fill="(#[0-9a-fA-F]{3,6})"', nearest, txt)
    svg_path.write_text(txt, encoding="utf-8")


def run_vtracer(img, out_svg: Path, *, colormode: str, mode: str,
                filter_speckle: int, color_precision: int, layer_difference: int,
                corner_threshold: int, path_precision: int) -> None:
    import vtracer
    kwargs = dict(
        colormode=colormode,          # 'color' | 'binary'
        hierarchical="stacked",       # 'stacked' | 'cutout'
        mode=mode,                     # 'spline' | 'polygon' | 'none'
        filter_speckle=filter_speckle,
        color_precision=color_precision,
        layer_difference=layer_difference,
        corner_threshold=corner_threshold,
        length_threshold=4.0,
        max_iterations=10,
        splice_threshold=45,
        path_precision=path_precision,
    )
    with tempfile.TemporaryDirectory() as td:
        tmp = Path(td) / "in.png"
        img.save(tmp)
        try:
            vtracer.convert_image_to_svg_py(str(tmp), str(out_svg), **kwargs)
        except TypeError:
            # versiones viejas de vtracer: firma minima
            vtracer.convert_image_to_svg_py(str(tmp), str(out_svg))


def add_viewbox(svg_path: Path) -> None:
    """Agrega viewBox si falta para que el SVG escale de forma responsiva."""
    import re
    txt = svg_path.read_text(encoding="utf-8")
    if "viewBox" in txt:
        return
    m = re.search(r'<svg\b[^>]*\bwidth="(\d+)"[^>]*\bheight="(\d+)"', txt)
    if not m:
        return
    w, h = m.group(1), m.group(2)
    txt = txt.replace("<svg ", f'<svg viewBox="0 0 {w} {h}" ', 1)
    svg_path.write_text(txt, encoding="utf-8")


def recolor_black(svg_path: Path, hex_color: str) -> None:
    txt = svg_path.read_text(encoding="utf-8")
    for token in ("#000000", "#000", "rgb(0,0,0)", "black"):
        txt = txt.replace(f'fill="{token}"', f'fill="{hex_color}"')
    svg_path.write_text(txt, encoding="utf-8")


def report(svg_path: Path) -> None:
    txt = svg_path.read_text(encoding="utf-8", errors="ignore")
    kb = svg_path.stat().st_size / 1024
    print(f"  {svg_path.name}: {txt.count('<path')} paths, {kb:.1f} KB")


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("input", nargs="?", type=Path, default=DEFAULT_IN,
                    help=f"PNG de entrada (default: {DEFAULT_IN.relative_to(REPO)})")
    ap.add_argument("-o", "--output", type=Path, default=None,
                    help="SVG de salida (default: junto al input, .svg)")
    ap.add_argument("--install", action="store_true",
                    help="instala vtracer con pip si falta")
    ap.add_argument("--faithful", action="store_true",
                    help="NO pegar a la paleta de marca; respeta los colores originales")
    ap.add_argument("--pad", type=float, default=0.01,
                    help="margen como fraccion del lado mayor (default 0.01)")
    ap.add_argument("--no-trim", action="store_true",
                    help="no recortar el borde transparente")
    ap.add_argument("--alpha-cutoff", type=int, default=128,
                    help="umbral de alpha para considerar un pixel opaco (0-255)")
    ap.add_argument("--colors", type=int, default=8,
                    help="color_precision de vtracer (mas alto = mas colores)")
    ap.add_argument("--speckle", type=int, default=4,
                    help="filter_speckle de vtracer (mas alto = menos ruido)")
    ap.add_argument("--mode", choices=["spline", "polygon", "none"], default="spline",
                    help="curvas del trazado (default spline)")
    ap.add_argument("--layer-difference", type=int, default=16)
    ap.add_argument("--corner-threshold", type=int, default=60)
    ap.add_argument("--path-precision", type=int, default=8)
    ap.add_argument("--silhouette", action="store_true",
                    help="ademas genera <name>-mono.svg (silueta de un color)")
    ap.add_argument("--mono-color", default="#1C1A17",
                    help="color de la silueta (default #1C1A17 = ink)")
    args = ap.parse_args()

    ensure_vtracer(args.install)

    out_svg = args.output or args.input.with_suffix(".svg")
    out_svg.parent.mkdir(parents=True, exist_ok=True)

    print(f"entrada : {args.input}")
    img = load_rgba(args.input)
    print(f"tamano  : {img.width}x{img.height}")
    img = trim_and_pad(img, args.pad, do_trim=not args.no_trim)

    color_img = img
    color_precision = args.colors
    if not args.faithful:
        print("paleta  : pegando colores a la paleta de marca")
        color_img = snap_to_palette(img, BRAND_PALETTE, args.alpha_cutoff)
        color_precision = max(args.colors, len(BRAND_PALETTE) + 2)

    print(f"trazando: {out_svg}")
    run_vtracer(
        color_img, out_svg,
        colormode="color", mode=args.mode,
        filter_speckle=args.speckle, color_precision=color_precision,
        layer_difference=args.layer_difference,
        corner_threshold=args.corner_threshold,
        path_precision=args.path_precision,
    )
    if not args.faithful:
        snap_svg_fills(out_svg, BRAND_PALETTE)
    add_viewbox(out_svg)
    report(out_svg)

    if args.silhouette:
        mono_svg = out_svg.with_name(out_svg.stem + "-mono.svg")
        print(f"silueta : {mono_svg}")
        sil = make_silhouette(img, args.alpha_cutoff)
        run_vtracer(
            sil, mono_svg,
            colormode="binary", mode=args.mode,
            filter_speckle=args.speckle, color_precision=2,
            layer_difference=args.layer_difference,
            corner_threshold=args.corner_threshold,
            path_precision=args.path_precision,
        )
        recolor_black(mono_svg, args.mono_color)
        add_viewbox(mono_svg)
        report(mono_svg)

    print("listo.")


if __name__ == "__main__":
    main()
