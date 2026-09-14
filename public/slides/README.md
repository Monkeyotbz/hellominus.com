# Slides del Hero — videos generados con IA

Carpeta donde se cargan los **videos de fondo** del hero del sitio
(carrusel de slides tipo "cinemático").

Se sirven directo desde `/slides/<archivo>` (Vite copia `public/` tal cual).

## Especificaciones de cada clip

| Parámetro | Valor recomendado |
|-----------|-------------------|
| Formato | `.mp4` (H.264/AAC-none) **obligatorio**; añade `.webm` (VP9) si puedes para mejor peso |
| Resolución horizontal | **1920×1080** (16:9) |
| Resolución vertical (móvil, opcional) | 1080×1920 (9:16), mismo nombre + `-v` |
| Duración | 6–12 s, **loop sin corte** (primer y último frame parecidos) |
| Audio | **Sin audio** (autoplay muteado) |
| Peso | ideal < 5 MB por clip (comprimir). Máx ~10 MB |
| Poster | imagen `.jpg` con el **mismo nombre base**, 1920×1080 (primer frame) — se muestra mientras carga el video |

## Nomenclatura

Prefijo numérico = orden en el carrusel:

```
public/slides/
├── 01-cartagena.mp4
├── 01-cartagena.jpg          (poster)
├── 01-cartagena-v.mp4        (vertical, opcional)
├── 02-medellin.mp4
├── 02-medellin.jpg
├── 03-eje-cafetero.mp4
└── ...
```

## Registro de slides

El orden, título y CTA de cada slide se define en
[`src/data/heroSlides.ts`](../../src/data/heroSlides.ts). Añade una entrada por clip.

## Nota sobre peso / git

Los videos son pesados. Opciones cuando haya varios:
1. **Git LFS** para versionarlos sin inflar el repo.
2. Mover a **Supabase Storage** (bucket `catalog` o uno `media`) y referenciar por URL.
Por ahora se dejan aquí para iterar rápido en el diseño.
