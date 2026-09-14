# 🗄️ Esquema Supabase — Turismo Colombia (proyecto nuevo)

> Diseño de la base de datos para el sitio profesional que reemplaza a turismocolombia.fit (GoDaddy).
> Estado: **borrador v1 para revisión** — no aplicar hasta aprobarlo. Fecha: 2026-09-01.

---

## Decisiones tomadas

| Tema | Decisión |
|------|----------|
| **Oro Nacional / Compra Oro** | ❌ Fuera de alcance por ahora. No se modela. |
| **Propiedades a la venta** | ✅ Catálogo propio de Turismo Colombia. Se modela **completo y filtrable** (ciudad, precio, tipo, alcobas, baños, área, estrato, parqueaderos, características…). Los **filtros de UI se construyen después**; primero cargar el catálogo. |
| **Reservas** | Operación en el **CRM propio** (por construir). Pero el cliente gestiona todo desde su cuenta: **calendario, tracking/timeline, documentos, estado**. → Supabase mantiene un espejo (`bookings` + `booking_events` + `booking_documents`); el CRM es el maestro y empuja cambios de estado. |
| **Idiomas** | **i18n total** (pauta mundial). Los textos traducibles van en **columnas `jsonb`** con forma `{ "es": "...", "en": "...", "pt": "..." }`. Agregar un idioma = agregar una clave, **sin migración**. Tabla `locales` para saber cuáles están activos. Helper SQL `i18n_text(data, locale, fallback)`. |
| **Newsletter** | Híbrido: se guarda en `newsletter_subscribers` (fuente de verdad) y se reenvía a un proveedor de envío (Mailchimp / Brevo / Resend). El CRM v1 no manda email masivo. |
| **Imágenes** | **Supabase Storage** (buckets), no `public/`. Las tablas guardan `storage_path`. |
| **IDs / auditoría** | `uuid` (`gen_random_uuid()`), `created_at`, `updated_at` (trigger), `created_by`. |
| **Slugs** | Uno por registro (`slug` único) + `slug_aliases text[]` para redirecciones. Slugs por idioma se pueden agregar luego. |

### Nota sobre i18n `jsonb` vs tablas de traducción
Se eligió `jsonb` por velocidad de construcción y porque "todos los idiomas" se vuelve trivial. La alternativa (tablas `*_translations`) es más rígida/auditable pero obliga a un `join` en cada consulta y duplica el modelo. Si en el futuro se necesita workflow de traducción por idioma, se puede migrar. **Si prefieres tablas de traducción desde el inicio, dímelo antes de aplicar.**

---

## Mapa de tablas

### Auth
- **`profiles`** — 1:1 con `auth.users`. `full_name`, `phone`, `avatar_path`, `role` (`user`/`editor`/`admin`), `locale`, `country`, `city`, documento, `marketing_opt_in`. Trigger que crea el perfil al registrarse; trigger que impide auto-escalar `role`.

### Config
- **`locales`** — `code` (`es`,`en`,`pt`,`fr`,`de`,`it`…), `name`, `native_name`, `is_default`, `is_active`, `sort_order`.
- **`site_settings`** — `key` → `value jsonb`. Semillas: `whatsapp_number`, `contact_email`, `contact_phone`, `social`, `announcement_bar` (i18n), `featured_offer`, `office_hours`, `default_locale`, `active_locales`. Elimina el WhatsApp hardcodeado en ~10 archivos.

### Catálogo turístico
- **`features`** + join tables — vocabulario compartido de amenidades / inclusiones / características inmobiliarias. `slug`, `kind` (`amenity`/`tour_inclusion`/`real_estate_feature`/`general`), `icon`, `label jsonb`. Joins: `accommodation_features`, `tour_features`, `real_estate_listing_features`. Permite filtrar bien más adelante.
- **`destinations`** — `slug`, `region`, `country`, `lat/lng`, `hero_image_path`; i18n: `name`, `tagline`, `description`, `best_time`, `highlights` (array i18n), SEO. `status`, `featured`, `sort_order`.
- **`accommodations`** (hospedajes) — `slug`, `type` (hotel/apartamento/casa/cabaña/hostal/glamping/finca), `destination_id?`, `city`, `region`, `address`, `lat/lng`, `price_from`, `currency`, `max_guests`, `bedrooms`, `beds`, `bathrooms`, `external_booking_url` + `external_platform` (booking/airbnb/direct), `check_in_time`, `check_out_time`; i18n: `name`, `summary`, `description`, `location_note`, SEO. + `accommodation_images` + `accommodation_features`.
- **`tours`** — `slug`, `destination_id?`, `city`, `region`, `category`, `meeting_point`, `duration_hours`, `duration_label`, `difficulty` (easy/moderate/hard/null), `price_from`, `currency`, `min_pax`, `max_pax`, `schedule_label`; i18n: `name`, `summary`, `description`, `itinerary`, `excluded` (array i18n), SEO. + `tour_images` + `tour_features` (inclusiones).
- **`events`** (eventos) — `slug`, `destination_id?`, `city`, `region`, `venue`, `start_date`, `end_date`, `is_recurring`, `ticket_url`, `price_from?`; i18n: `name`, `description`, `month_label`, SEO. + `event_images`.

### Inmobiliaria
- **`real_estate_listings`** — `slug`, `reference_code` (único, interno), `destination_id?`, `operation` (`sale`/`rent`), `property_type` (apartment/house/lot/farm/commercial/office/building), `availability` (available/reserved/sold/rented), `city`, `region`, `neighborhood`, `address` (privada), `lat/lng`, `hide_exact_location`, `price`, `currency`, `price_period` (rent), `hoa_fee` (administración), `area_total_m2`, `area_built_m2`, `bedrooms`, `bathrooms`, `half_bathrooms`, `parking_spaces`, `stratum` (1–6), `floor`, `floors_total`, `year_built`, `is_furnished`, `allows_pets`; i18n: `title`, `description`, SEO. + `real_estate_listing_images` + `real_estate_listing_features`. Campos ricos para búsqueda; UI de filtros después.

### Contenido
- **`blog_categories`** — `slug`, `name jsonb`, `sort_order`.
- **`blog_posts`** — `slug`, `category_id?`, `cover_image_path`, `author_id` (→ `profiles`), `published_at`, `status`, `featured`, `reading_minutes`, `tags text[]`; i18n: `title`, `excerpt`, `body` (Markdown), SEO.
- **`testimonials`** — `author_name`, `author_location`, `rating` (1–5), `avatar_path`, `source` (google/whatsapp/instagram/direct), `related_type?`, `related_id?`, `featured`, `status`; i18n: `quote`. (Prueba social — clave para verse profesional.)

### Conversión → puente al CRM
- **`leads`** — tabla central. `type` (accommodation/tour/event/real_estate/general/newsletter), `name`, `whatsapp`, `email`, `locale`, `message`, `related_type?`/`related_id?`, `check_in?`, `check_out?`, `guests?`, `budget?`, `preferred_dates_note`, `source` + `utm_*` + `referrer` + `landing_path`, `status` (new/contacted/qualified/won/lost), `assigned_to?`, `synced_to_crm`, `crm_id`, `synced_at`, `raw jsonb`, `ip`, `user_agent`. **`anon` solo puede INSERT**; leer/editar solo staff.
- **`newsletter_subscribers`** — `email` (citext, único), `name`, `locale`, `status` (pending/subscribed/unsubscribed/bounced/complained), `source` + `utm_*` + `landing_path`, `consent_at`, `confirmed_at`, `unsubscribed_at`, `external_provider`, `external_id`. `anon` solo INSERT.

### Reservas (espejo para el portal del cliente)
- **`bookings`** — `reference` (código humano `TC-2026-0001`), `user_id?` (→ `auth.users`), `contact_name/email/whatsapp`, `type` (accommodation/tour/event/package/real_estate_visit), `item_type?`/`item_id?`/`item_title_snapshot`, `start_date`, `end_date`, `guests`, `pax_detail jsonb`, `status` (draft/pending_payment/confirmed/in_progress/completed/cancelled/no_show), `payment_status` (unpaid/partial/paid/refunded), `total_amount`, `paid_amount`, `currency`, `notes`, `lead_id?`, `crm_id?`, `source`. RLS: el cliente ve **solo las suyas** (`user_id = auth.uid()`); escribe staff / service-role (sync del CRM).
- **`booking_events`** — timeline/tracking. `booking_id`, `type` (created/payment_received/confirmed/message/reminder/itinerary_sent/status_changed/cancelled/custom), `title jsonb`, `body jsonb`, `visible_to_client`, `created_by_role` (system/staff/crm/client), `created_at`. El cliente ve los `visible_to_client` de sus reservas.
- **`booking_documents`** — `booking_id`, `kind` (voucher/invoice/itinerary/receipt/other), `storage_path`, `label`, `visible_to_client`.

---

## Modelo de seguridad (RLS)

| Rol | Acceso |
|-----|--------|
| `anon` (visitante) | **Lectura** de catálogo/contenido con `status = 'published'`. **Insert** en `leads` y `newsletter_subscribers`. Nada más. |
| `authenticated` (cliente) | Lo de `anon` + leer/editar **su** `profile`, ver **sus** `bookings` / `booking_events` (visibles) / `booking_documents` (visibles). |
| `role = 'editor'` | Todo el catálogo y contenido (CRUD). Ver leads/bookings. |
| `role = 'admin'` | Todo, incluida gestión de usuarios y `role`. |
| `service_role` (CRM / jobs) | Bypassa RLS. Sync de bookings, marca `synced_to_crm`, etc. |

Helpers: `is_staff()`, `is_admin()` (SECURITY DEFINER sobre `profiles`). Helpers de migración `_catalog_rls('tabla')` y `_child_rls('tabla','padre','fk')` para no repetir políticas.

---

## Archivos de migración (`supabase/migrations/`)

| Archivo | Contenido |
|---------|-----------|
| `20260901120001_foundation.sql` | Extensiones, `set_updated_at()`, `i18n_text()`, helpers `_catalog_rls` / `_child_rls`, tabla `locales` + semillas |
| `20260901120002_profiles.sql` | `profiles`, triggers de alta y de protección de `role`, `is_staff()` / `is_admin()` |
| `20260901120003_catalog.sql` | `features` + joins, `destinations`, `accommodations`, `tours`, `events` + imágenes |
| `20260901120004_real_estate.sql` | `real_estate_listings` + imágenes + features |
| `20260901120005_content.sql` | `blog_categories`, `blog_posts`, `testimonials` |
| `20260901120006_leads_newsletter.sql` | `leads`, `newsletter_subscribers` |
| `20260901120007_bookings.sql` | `bookings`, `booking_events`, `booking_documents` |
| `20260901120008_site_settings.sql` | `site_settings` + semillas |
| `20260901120009_storage.sql` | Buckets de Storage + políticas |

---

## Estado

✅ **Aplicado al proyecto `axgsejwdymeetgijbkgh`** el 2026-09-01 (`supabase db push`, 9 migraciones). Verificado por REST: `locales` y `site_settings` sembrados, RLS activa (anon lee catálogo público, `leads` bloqueado a lectura anónima).

- **i18n**: `jsonb` (Opción A). Decidido para 2 idiomas; se reevalúa si se suman muchos más.
- Idiomas activos: `es` (default) + `en`. `pt/fr/de/it` en la tabla, inactivos.
- `packages` (combos hospedaje+tour): después, no en v1.
- `reference` de bookings: `TC-YYYY-NNNNN` (secuencia global, no reinicia por año).

### Pendiente
1. Crear un usuario y ponerle `role = 'admin'` en `profiles` (dashboard) para poder cargar catálogo.
2. Ajustar semillas de `site_settings` (email real, redes, número WhatsApp definitivo).
3. Moneda: `COP` base. ¿Mostrar `USD` calculado en front para pauta internacional?
4. `seed.sql`: cargar el catálogo real (14 hospedajes + ~42 tours de `showcases.ts` + contenido de GoDaddy).
5. Rehacer el cliente (`supabaseClient.ts`, contextos, componentes) contra el esquema nuevo — el código actual apunta a tablas viejas (`users`, `properties`, `tours` con otras columnas) que ya no existen.
