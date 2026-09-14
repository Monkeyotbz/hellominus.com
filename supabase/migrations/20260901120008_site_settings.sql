-- =============================================================================
-- 20260901120008_site_settings.sql
-- Configuración del sitio en clave/valor. Reemplaza los valores hardcodeados
-- (WhatsApp, redes, barra de anuncios, etc.). Lectura pública, escritura staff.
-- =============================================================================

create table public.site_settings (
  key        text primary key,
  value      jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create trigger trg_site_settings_updated before update on public.site_settings
  for each row execute function public.set_updated_at();

alter table public.site_settings enable row level security;

create policy "site_settings_public_read" on public.site_settings
  for select to anon, authenticated using (true);

create policy "site_settings_staff_write" on public.site_settings
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- --- Semillas -------------------------------------------------------------
insert into public.site_settings (key, value) values
  ('contact', jsonb_build_object(
    'whatsapp_number', '573145284548',
    'whatsapp_default_text', jsonb_build_object(
      'es', 'Hola, quiero información sobre Turismo Colombia',
      'en', 'Hi, I''d like information about Turismo Colombia'
    ),
    'email', 'reservas@turismocolombia.fit',
    'phone', '3145284548',
    'office_hours', jsonb_build_object('es', 'Cita previa', 'en', 'By appointment')
  )),
  ('social', jsonb_build_object(
    'instagram', '',
    'facebook', '',
    'tiktok', '',
    'youtube', ''
  )),
  ('announcement_bar', jsonb_build_object(
    'enabled', true,
    'text', jsonb_build_object(
      'es', 'Vive Colombia: tours, hospedajes y experiencias inolvidables',
      'en', 'Experience Colombia: tours, stays and unforgettable experiences'
    )
  )),
  ('featured_offer', jsonb_build_object(
    'enabled', false,
    'title', jsonb_build_object('es', 'Ruta en Helicóptero — Jardín', 'en', 'Helicopter Route — Jardín'),
    'href', '',
    'image_path', ''
  )),
  ('i18n', jsonb_build_object(
    'default_locale', 'es',
    'active_locales', jsonb_build_array('es', 'en')
  )),
  ('brand', jsonb_build_object(
    'name', 'Turismo Colombia',
    'domain', 'turismocolombia.fit'
  ));
