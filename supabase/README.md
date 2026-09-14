# Supabase — Turismo Colombia

Esquema del proyecto **nuevo** de Supabase. Ver el diseño completo en [`ESQUEMA.md`](./ESQUEMA.md).

## Contenido

```
supabase/
├─ ESQUEMA.md              Diseño y decisiones (leer primero)
├─ migrations/             Migraciones SQL en orden
│  ├─ 20260901120001_foundation.sql        extensiones, helpers, locales
│  ├─ 20260901120002_profiles.sql          profiles + is_staff()/is_admin()
│  ├─ 20260901120003_catalog.sql           features, destinos, hospedajes, tours, eventos
│  ├─ 20260901120004_real_estate.sql       propiedades a la venta
│  ├─ 20260901120005_content.sql           blog + testimonios
│  ├─ 20260901120006_leads_newsletter.sql  captura de leads + newsletter
│  ├─ 20260901120007_bookings.sql          espejo de reservas + tracking
│  ├─ 20260901120008_site_settings.sql     configuración clave/valor
│  └─ 20260901120009_storage.sql           buckets de Storage
└─ seed.sql                (pendiente) carga inicial del catálogo
```

## Cómo aplicarlo

### Opción A — Supabase CLI (recomendado)

```bash
npm i -g supabase
supabase login
supabase link --project-ref <PROJECT_REF>   # del dashboard: Settings → General
supabase db push                            # aplica todas las migraciones de supabase/migrations
```

### Opción B — SQL Editor del dashboard

Ejecutar el contenido de cada archivo de `migrations/` **en orden numérico**.

## Después de aplicar

1. Crear un usuario, y en `profiles` poner su `role = 'admin'` (desde el dashboard).
2. Configurar `.env` en la raíz del proyecto:
   ```
   VITE_SUPABASE_URL=https://<PROJECT_REF>.supabase.co
   VITE_SUPABASE_ANON_KEY=<anon key>
   ```
3. Revisar/ajustar las semillas de `site_settings` (WhatsApp, email, redes).
4. Sembrar el catálogo (`seed.sql`, pendiente de generar a partir del contenido actual).

## Notas

- Textos traducibles = columnas `jsonb` `{ "es": "...", "en": "..." }`. Helper SQL: `i18n_text(col, 'en')`.
- RLS: público lee sólo `status = 'published'`; escribe `role in ('editor','admin')`; el CRM usará `service_role` (bypassa RLS).
- Imágenes en Storage (`catalog`, `avatars`, `booking-docs`), no en `public/`.
- El `service_role` key **nunca** va al front ni al repo.
