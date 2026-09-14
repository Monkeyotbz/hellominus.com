# Catálogo Turismo Colombia (MVP)

Catálogo de **tours, hospedajes y destinos** listo para sembrar en la base de datos.
Fuente reconstruida de `src/data/showcases.ts` + las fotos de `public/` (contenido
recuperado de turismocolombia.fit).

## Archivos

| Archivo | Qué es |
|---|---|
| `catalog.json` | **Fuente de verdad.** Estructura completa: `features`, `destinations`, `accommodations`, `tours`, con imágenes y amenities anidadas. Editá acá. |
| `build-sql.mjs` | Genera `seed.sql` a partir de `catalog.json`. `node catalog/build-sql.mjs` |
| `seed.sql` | **Generado.** UPSERT idempotente contra el esquema de `src/types/supabase.ts`. |
| `upload-images.mjs` | Sube `public/<source>` → `<bucket>/<storage_path>` a Supabase Storage. |

## Contenido

- **45 features** (30 amenities + 15 inclusiones de tour)
- **7 destinos**: Cartagena, Medellín, Jardín, Jericó, Guatapé, San Jerónimo, Huila
- **14 hospedajes** — los 14 de `showcases.ts`, con 5–10 fotos cada uno (93 en total), amenities, precio, capacidad y link externo de Booking/Airbnb donde había
- **32 tours** — Cartagena (15, textos reescritos porque el original tenía OCR corrupto), Medellín (9), Jardín (8). Las 3 modalidades de cada travesía de Jardín (caminata / transporte / cabalgata) se colapsaron en un tour con la modalidad en la descripción.

Lo que **no** trae (MVP, no 100 %): traducción `en`, precios de la mayoría de tours de Cartagena (van `null` → "Consultar"), `itinerary`/`excluded`/`meta_*`, galería de fotos por tour (solo portada), reviews.

## Cómo sembrar

### 1. Base de datos
`seed.sql` asume estas tablas (esquema de `src/types/supabase.ts`), con `slug` único en
`destinations` / `accommodations` / `tours`:

```
destinations, destination_images
accommodations, accommodation_images, accommodation_features
tours, tour_images, tour_features
features
```

Correr:
```bash
psql "$DATABASE_URL" -f catalog/seed.sql
# o pegar en el SQL editor de Supabase
```
Es idempotente: reinserta features por `slug`, y borra+reinserta imágenes y amenities
de cada ítem. Correr las veces que haga falta.

> Si el CRM (candyCRM) usa otros nombres de tabla/columna, ajustar el mapeo en
> `build-sql.mjs` y regenerar. `catalog.json` no cambia.

### 2. Imágenes
Las fotos viven hoy en `public/` de este repo. Hay que subirlas al bucket de Storage
que use el catálogo (`catalog` por convención — `catalogImageUrl()` en
`src/lib/supabase.ts` ya lo espera):

```bash
CATALOG_SUPABASE_URL=https://xxxx.supabase.co \
CATALOG_SUPABASE_SERVICE_KEY=eyJ... \
CATALOG_BUCKET=catalog \
node catalog/upload-images.mjs
```

Cada `images[].storage_path` queda como `hospedajes/<slug>/NN.jpg`,
`tours/<slug>/cover.png`, `destinos/<slug>/NN.jpg`.

## Contrato

Los campos de `catalog.json` son el contrato de datos entre el sitio y el CRM
(ver memoria `proyecto-turismo-colombia`). El sitio los consume por
`src/lib/queries.ts` (`TourWithMedia`, `StayWithMedia`, `DestinationWithMedia`).
