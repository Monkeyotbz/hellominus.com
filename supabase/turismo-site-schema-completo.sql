-- =============================================================================
-- 20260901120001_foundation.sql
-- Extensiones, funciones utilitarias, helpers de RLS para migraciones, locales.
-- =============================================================================

-- --- Extensiones -------------------------------------------------------------
create extension if not exists "pgcrypto"  with schema extensions;  -- gen_random_uuid()
create extension if not exists "citext"    with schema extensions;  -- emails case-insensitive
create extension if not exists "unaccent"  with schema extensions;  -- búsqueda sin acentos (futuro)

-- --- updated_at automático --------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- --- i18n: elegir un idioma de un mapa jsonb con cadena de fallback --------
-- data tiene forma { "es": "...", "en": "...", a... }  (o arrays por idioma)
create or replace function public.i18n_text(data jsonb, locale text, fallback text default 'es')
returns text
language sql
immutable
as $$
  select coalesce(
    nullif(data ->> locale, ''),
    nullif(data ->> fallback, ''),
    nullif(data ->> 'es', ''),
    (select v from jsonb_each_text(coalesce(data, '{}'::jsonb)) as e(k, v) where v <> '' limit 1)
  );
$$;

-- =============================================================================
-- Helpers para no repetir políticas RLS en cada tabla de catálogo/contenido.
-- Se usan SÓLO dentro de las migraciones:  select public._catalog_rls('tours');
-- =============================================================================

-- Tabla "raíz" con columna status: lectura pública si published, escritura staff.
create or replace function public._catalog_rls(p_table text)
returns void
language plpgsql
as $$
begin
  execute format('alter table public.%I enable row level security', p_table);

  execute format(
    $f$create policy "%1$s_public_read" on public.%1$I
        for select to anon, authenticated
        using (status = 'published' or public.is_staff())$f$,
    p_table);

  execute format(
    $f$create policy "%1$s_staff_write" on public.%1$I
        for all to authenticated
        using (public.is_staff()) with check (public.is_staff())$f$,
    p_table);
end;
$$;

-- Tabla "hija" (imágenes, features-join, etc.): visible si su padre lo es.
create or replace function public._child_rls(p_table text, p_parent text, p_fk text)
returns void
language plpgsql
as $$
begin
  execute format('alter table public.%I enable row level security', p_table);

  execute format(
    $f$create policy "%1$s_public_read" on public.%1$I
        for select to anon, authenticated
        using (exists (
          select 1 from public.%2$I par
          where par.id = %3$I
            and (par.status = 'published' or public.is_staff())
        ))$f$,
    p_table, p_parent, p_fk);

  execute format(
    $f$create policy "%1$s_staff_write" on public.%1$I
        for all to authenticated
        using (public.is_staff()) with check (public.is_staff())$f$,
    p_table);
end;
$$;

-- =============================================================================
-- is_staff() / is_admin()
-- Stubs aquí (public.profiles todavía no existe). Se REDEFINEN con el cuerpo
-- real en 20260901120002_profiles.sql. Las políticas RLS ya pueden referenciarlos.
-- =============================================================================
create or replace function public.is_staff()
returns boolean language sql stable
as $$ select false $$;

create or replace function public.is_admin()
returns boolean language sql stable
as $$ select false $$;

-- =============================================================================
-- locales
-- =============================================================================
create table public.locales (
  code        text primary key,
  name        text not null,
  native_name text,
  flag_emoji  text,
  is_default  boolean not null default false,
  is_active   boolean not null default true,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

-- un solo idioma por defecto
create unique index locales_one_default on public.locales (is_default) where is_default;

alter table public.locales enable row level security;

create policy "locales_public_read" on public.locales
  for select to anon, authenticated using (true);

create policy "locales_admin_write" on public.locales
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Activos ahora: es (default) + en. El resto quedan listos pero inactivos
-- (activar = update is_active = true, sin migración).
insert into public.locales (code, name, native_name, flag_emoji, is_default, is_active, sort_order) values
  ('es', 'Spanish',    'Español',    '🇪🇸', true,  true,  0),
  ('en', 'English',    'English',    '🇺🇸', false, true,  1),
  ('pt', 'Portuguese', 'Português',  '🇧🇷', false, false, 2),
  ('fr', 'French',     'Français',   '🇫🇷', false, false, 3),
  ('de', 'German',     'Deutsch',    '🇩🇪', false, false, 4),
  ('it', 'Italian',    'Italiano',   '🇮🇹', false, false, 5);
-- =============================================================================
-- 20260901120002_profiles.sql
-- Perfil de usuario (1:1 con auth.users) + helpers is_staff() / is_admin().
-- =============================================================================

create table public.profiles (
  id               uuid primary key references auth.users(id) on delete cascade,
  full_name        text,
  phone            text,
  avatar_path      text,
  role             text not null default 'user' check (role in ('user', 'editor', 'admin')),
  locale           text not null default 'es' references public.locales(code),
  country          text,
  city             text,
  document_type    text check (document_type in ('CC', 'CE', 'PAS', 'NIT', 'TI')),
  document_number  text,
  marketing_opt_in boolean not null default false,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index profiles_role_idx on public.profiles (role);

create trigger trg_profiles_updated
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- --- Helpers de rol (SECURITY DEFINER para poder leer profiles bajo RLS) ---
create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('editor', 'admin')
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

-- --- Alta automática de perfil al registrarse -----------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone, locale)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'phone',
    coalesce(new.raw_user_meta_data ->> 'locale', 'es')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- --- Impedir que un usuario se auto-escale el rol -------------------------
create or replace function public.protect_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role and not public.is_admin() then
    new.role := old.role;
  end if;
  return new;
end;
$$;

create trigger trg_profiles_protect_role
  before update on public.profiles
  for each row execute function public.protect_profile_role();

-- --- RLS -----------------------------------------------------------------
alter table public.profiles enable row level security;

create policy "profiles_insert_own" on public.profiles
  for insert to authenticated
  with check (id = auth.uid());

create policy "profiles_read_own_or_staff" on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.is_staff());

create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "profiles_admin_all" on public.profiles
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());
-- =============================================================================
-- 20260901120003_catalog.sql
-- Vocabulario de características + Destinos + Hospedajes + Tours + Eventos.
-- Textos traducibles en columnas jsonb: { "es": "...", "en": "..." }.
-- =============================================================================

-- =============================================================================
-- features  (amenidades / inclusiones de tour / características inmobiliarias)
-- =============================================================================
create table public.features (
  id         uuid primary key default gen_random_uuid(),
  slug       text unique not null,
  kind       text not null default 'general'
             check (kind in ('amenity', 'tour_inclusion', 'real_estate_feature', 'general')),
  icon       text,
  label      jsonb not null default '{}'::jsonb,   -- { "es": "WiFi gratis", "en": "Free WiFi" }
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index features_kind_idx on public.features (kind);

alter table public.features enable row level security;
create policy "features_public_read" on public.features
  for select to anon, authenticated using (true);
create policy "features_staff_write" on public.features
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- =============================================================================
-- destinations
-- =============================================================================
create table public.destinations (
  id               uuid primary key default gen_random_uuid(),
  slug             text unique not null,
  slug_aliases     text[] not null default '{}',
  region           text,
  country          text not null default 'Colombia',
  latitude         numeric(9, 6),
  longitude        numeric(9, 6),
  hero_image_path  text,
  name             jsonb not null default '{}'::jsonb,
  tagline          jsonb not null default '{}'::jsonb,
  description      jsonb not null default '{}'::jsonb,
  best_time        jsonb not null default '{}'::jsonb,
  highlights       jsonb not null default '{}'::jsonb,  -- { "es": ["...","..."] }
  meta_title       jsonb not null default '{}'::jsonb,
  meta_description jsonb not null default '{}'::jsonb,
  status           text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  featured         boolean not null default false,
  sort_order       int not null default 0,
  created_by       uuid references auth.users(id),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index destinations_status_idx   on public.destinations (status);
create index destinations_featured_idx on public.destinations (featured) where featured;
create trigger trg_destinations_updated before update on public.destinations
  for each row execute function public.set_updated_at();
select public._catalog_rls('destinations');

create table public.destination_images (
  id             uuid primary key default gen_random_uuid(),
  destination_id uuid not null references public.destinations(id) on delete cascade,
  storage_path   text not null,
  alt            jsonb not null default '{}'::jsonb,
  credit         text,
  sort_order     int not null default 0,
  is_cover       boolean not null default false,
  created_at     timestamptz not null default now()
);
create index destination_images_parent_idx on public.destination_images (destination_id, sort_order);
select public._child_rls('destination_images', 'destinations', 'destination_id');

-- =============================================================================
-- accommodations
-- =============================================================================
create table public.accommodations (
  id                  uuid primary key default gen_random_uuid(),
  slug                text unique not null,
  slug_aliases        text[] not null default '{}',
  type                text not null default 'hotel'
                      check (type in ('hotel','apartment','house','cabin','hostel','glamping','finca')),
  destination_id      uuid references public.destinations(id) on delete set null,
  city                text,
  region              text,
  country             text not null default 'Colombia',
  address             text,
  latitude            numeric(9, 6),
  longitude           numeric(9, 6),
  price_from          numeric(12, 2),
  currency            text not null default 'COP',
  max_guests          int,
  bedrooms            int,
  beds                int,
  bathrooms           int,
  external_booking_url text,
  external_platform   text check (external_platform in ('booking','airbnb','direct','other')),
  check_in_time       text,
  check_out_time      text,
  name                jsonb not null default '{}'::jsonb,
  summary             jsonb not null default '{}'::jsonb,
  description         jsonb not null default '{}'::jsonb,
  location_note       jsonb not null default '{}'::jsonb,
  meta_title          jsonb not null default '{}'::jsonb,
  meta_description    jsonb not null default '{}'::jsonb,
  status              text not null default 'draft' check (status in ('draft','published','archived')),
  featured            boolean not null default false,
  sort_order          int not null default 0,
  created_by          uuid references auth.users(id),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create index accommodations_status_idx    on public.accommodations (status);
create index accommodations_featured_idx  on public.accommodations (featured) where featured;
create index accommodations_city_idx      on public.accommodations (city);
create index accommodations_dest_idx      on public.accommodations (destination_id);
create index accommodations_type_idx      on public.accommodations (type);
create trigger trg_accommodations_updated before update on public.accommodations
  for each row execute function public.set_updated_at();
select public._catalog_rls('accommodations');

create table public.accommodation_images (
  id               uuid primary key default gen_random_uuid(),
  accommodation_id uuid not null references public.accommodations(id) on delete cascade,
  storage_path     text not null,
  alt              jsonb not null default '{}'::jsonb,
  sort_order       int not null default 0,
  is_cover         boolean not null default false,
  created_at       timestamptz not null default now()
);
create index accommodation_images_parent_idx on public.accommodation_images (accommodation_id, sort_order);
select public._child_rls('accommodation_images', 'accommodations', 'accommodation_id');

create table public.accommodation_features (
  accommodation_id uuid not null references public.accommodations(id) on delete cascade,
  feature_id       uuid not null references public.features(id) on delete cascade,
  primary key (accommodation_id, feature_id)
);
select public._child_rls('accommodation_features', 'accommodations', 'accommodation_id');

-- =============================================================================
-- tours
-- =============================================================================
create table public.tours (
  id               uuid primary key default gen_random_uuid(),
  slug             text unique not null,
  slug_aliases     text[] not null default '{}',
  destination_id   uuid references public.destinations(id) on delete set null,
  city             text,
  region           text,
  category         text,
  meeting_point    text,
  duration_hours   numeric(5, 2),
  duration_label   jsonb not null default '{}'::jsonb,
  difficulty       text check (difficulty in ('easy','moderate','hard')),
  price_from       numeric(12, 2),
  currency         text not null default 'COP',
  min_pax          int,
  max_pax          int,
  schedule_label   jsonb not null default '{}'::jsonb,
  name             jsonb not null default '{}'::jsonb,
  summary          jsonb not null default '{}'::jsonb,
  description      jsonb not null default '{}'::jsonb,
  itinerary        jsonb not null default '{}'::jsonb,
  excluded         jsonb not null default '{}'::jsonb,   -- { "es": ["...","..."] }
  meta_title       jsonb not null default '{}'::jsonb,
  meta_description jsonb not null default '{}'::jsonb,
  status           text not null default 'draft' check (status in ('draft','published','archived')),
  featured         boolean not null default false,
  sort_order       int not null default 0,
  created_by       uuid references auth.users(id),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index tours_status_idx   on public.tours (status);
create index tours_featured_idx on public.tours (featured) where featured;
create index tours_city_idx     on public.tours (city);
create index tours_dest_idx     on public.tours (destination_id);
create index tours_category_idx on public.tours (category);
create trigger trg_tours_updated before update on public.tours
  for each row execute function public.set_updated_at();
select public._catalog_rls('tours');

create table public.tour_images (
  id         uuid primary key default gen_random_uuid(),
  tour_id    uuid not null references public.tours(id) on delete cascade,
  storage_path text not null,
  alt        jsonb not null default '{}'::jsonb,
  sort_order int not null default 0,
  is_cover   boolean not null default false,
  created_at timestamptz not null default now()
);
create index tour_images_parent_idx on public.tour_images (tour_id, sort_order);
select public._child_rls('tour_images', 'tours', 'tour_id');

create table public.tour_features (
  tour_id    uuid not null references public.tours(id) on delete cascade,
  feature_id uuid not null references public.features(id) on delete cascade,
  primary key (tour_id, feature_id)
);
select public._child_rls('tour_features', 'tours', 'tour_id');

-- =============================================================================
-- events
-- =============================================================================
create table public.events (
  id               uuid primary key default gen_random_uuid(),
  slug             text unique not null,
  slug_aliases     text[] not null default '{}',
  destination_id   uuid references public.destinations(id) on delete set null,
  city             text,
  region           text,
  venue            text,
  start_date       date,
  end_date         date,
  is_recurring     boolean not null default false,
  ticket_url       text,
  price_from       numeric(12, 2),
  currency         text not null default 'COP',
  name             jsonb not null default '{}'::jsonb,
  description      jsonb not null default '{}'::jsonb,
  month_label      jsonb not null default '{}'::jsonb,
  meta_title       jsonb not null default '{}'::jsonb,
  meta_description jsonb not null default '{}'::jsonb,
  status           text not null default 'draft' check (status in ('draft','published','archived')),
  featured         boolean not null default false,
  sort_order       int not null default 0,
  created_by       uuid references auth.users(id),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index events_status_idx     on public.events (status);
create index events_featured_idx   on public.events (featured) where featured;
create index events_start_date_idx on public.events (start_date);
create trigger trg_events_updated before update on public.events
  for each row execute function public.set_updated_at();
select public._catalog_rls('events');

create table public.event_images (
  id         uuid primary key default gen_random_uuid(),
  event_id   uuid not null references public.events(id) on delete cascade,
  storage_path text not null,
  alt        jsonb not null default '{}'::jsonb,
  sort_order int not null default 0,
  is_cover   boolean not null default false,
  created_at timestamptz not null default now()
);
create index event_images_parent_idx on public.event_images (event_id, sort_order);
select public._child_rls('event_images', 'events', 'event_id');
-- =============================================================================
-- 20260901120004_real_estate.sql
-- Catálogo inmobiliario de Turismo Colombia ("Propiedades a la venta").
-- Campos ricos para búsqueda; los filtros de UI se construyen después.
-- =============================================================================

create table public.real_estate_listings (
  id                  uuid primary key default gen_random_uuid(),
  slug                text unique not null,
  slug_aliases        text[] not null default '{}',
  reference_code      text unique,                       -- código interno
  destination_id      uuid references public.destinations(id) on delete set null,

  operation           text not null default 'sale' check (operation in ('sale', 'rent')),
  property_type       text not null default 'apartment'
                      check (property_type in ('apartment','house','lot','farm','commercial','office','building')),
  availability        text not null default 'available'
                      check (availability in ('available','reserved','sold','rented')),

  city                text,
  region              text,
  neighborhood        text,
  address             text,                              -- privado, no exponer en API pública sin cuidado
  latitude            numeric(9, 6),
  longitude           numeric(9, 6),
  hide_exact_location boolean not null default true,

  price               numeric(14, 2),
  currency            text not null default 'COP',
  price_period        text check (price_period in ('month', 'year')),   -- para 'rent'
  hoa_fee             numeric(12, 2),                     -- administración

  area_total_m2       numeric(10, 2),
  area_built_m2       numeric(10, 2),
  bedrooms            int,
  bathrooms           int,
  half_bathrooms      int,
  parking_spaces      int,
  stratum             int check (stratum between 1 and 6),
  floor               int,
  floors_total        int,
  year_built          int,
  is_furnished        boolean not null default false,
  allows_pets         boolean not null default false,

  title               jsonb not null default '{}'::jsonb,
  description         jsonb not null default '{}'::jsonb,
  meta_title          jsonb not null default '{}'::jsonb,
  meta_description    jsonb not null default '{}'::jsonb,

  status              text not null default 'draft' check (status in ('draft','published','archived')),
  featured            boolean not null default false,
  sort_order          int not null default 0,
  created_by          uuid references auth.users(id),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index real_estate_status_idx     on public.real_estate_listings (status);
create index real_estate_featured_idx   on public.real_estate_listings (featured) where featured;
create index real_estate_operation_idx  on public.real_estate_listings (operation);
create index real_estate_type_idx       on public.real_estate_listings (property_type);
create index real_estate_city_idx       on public.real_estate_listings (city);
create index real_estate_price_idx      on public.real_estate_listings (price);
create index real_estate_bedrooms_idx   on public.real_estate_listings (bedrooms);

create trigger trg_real_estate_updated before update on public.real_estate_listings
  for each row execute function public.set_updated_at();

select public._catalog_rls('real_estate_listings');

create table public.real_estate_listing_images (
  id           uuid primary key default gen_random_uuid(),
  listing_id   uuid not null references public.real_estate_listings(id) on delete cascade,
  storage_path text not null,
  alt          jsonb not null default '{}'::jsonb,
  sort_order   int not null default 0,
  is_cover     boolean not null default false,
  created_at   timestamptz not null default now()
);
create index real_estate_images_parent_idx on public.real_estate_listing_images (listing_id, sort_order);
select public._child_rls('real_estate_listing_images', 'real_estate_listings', 'listing_id');

create table public.real_estate_listing_features (
  listing_id uuid not null references public.real_estate_listings(id) on delete cascade,
  feature_id uuid not null references public.features(id) on delete cascade,
  primary key (listing_id, feature_id)
);
select public._child_rls('real_estate_listing_features', 'real_estate_listings', 'listing_id');
-- =============================================================================
-- 20260901120005_content.sql
-- Blog (categorías + posts) y testimonios / prueba social.
-- =============================================================================

-- =============================================================================
-- blog_categories
-- =============================================================================
create table public.blog_categories (
  id         uuid primary key default gen_random_uuid(),
  slug       text unique not null,
  name       jsonb not null default '{}'::jsonb,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
alter table public.blog_categories enable row level security;
create policy "blog_categories_public_read" on public.blog_categories
  for select to anon, authenticated using (true);
create policy "blog_categories_staff_write" on public.blog_categories
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- =============================================================================
-- blog_posts
-- =============================================================================
create table public.blog_posts (
  id               uuid primary key default gen_random_uuid(),
  slug             text unique not null,
  slug_aliases     text[] not null default '{}',
  category_id      uuid references public.blog_categories(id) on delete set null,
  cover_image_path text,
  author_id        uuid references public.profiles(id) on delete set null,
  tags             text[] not null default '{}',
  reading_minutes  int,
  title            jsonb not null default '{}'::jsonb,
  excerpt          jsonb not null default '{}'::jsonb,
  body             jsonb not null default '{}'::jsonb,   -- Markdown por idioma
  meta_title       jsonb not null default '{}'::jsonb,
  meta_description jsonb not null default '{}'::jsonb,
  status           text not null default 'draft' check (status in ('draft','published','archived')),
  featured         boolean not null default false,
  published_at     timestamptz,
  created_by       uuid references auth.users(id),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index blog_posts_status_idx    on public.blog_posts (status);
create index blog_posts_published_idx on public.blog_posts (published_at desc);
create index blog_posts_category_idx  on public.blog_posts (category_id);
create index blog_posts_featured_idx  on public.blog_posts (featured) where featured;

create trigger trg_blog_posts_updated before update on public.blog_posts
  for each row execute function public.set_updated_at();

alter table public.blog_posts enable row level security;
create policy "blog_posts_public_read" on public.blog_posts
  for select to anon, authenticated
  using ((status = 'published' and coalesce(published_at, now()) <= now()) or public.is_staff());
create policy "blog_posts_staff_write" on public.blog_posts
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- =============================================================================
-- testimonials
-- =============================================================================
create table public.testimonials (
  id              uuid primary key default gen_random_uuid(),
  author_name     text not null,
  author_location text,
  rating          int check (rating between 1 and 5),
  avatar_path     text,
  source          text check (source in ('google','whatsapp','instagram','facebook','tripadvisor','direct')),
  related_type    text check (related_type in ('accommodation','tour','event','real_estate','general')),
  related_id      uuid,
  quote           jsonb not null default '{}'::jsonb,
  status          text not null default 'draft' check (status in ('draft','published','archived')),
  featured        boolean not null default false,
  sort_order      int not null default 0,
  created_by      uuid references auth.users(id),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index testimonials_status_idx   on public.testimonials (status);
create index testimonials_featured_idx on public.testimonials (featured) where featured;

create trigger trg_testimonials_updated before update on public.testimonials
  for each row execute function public.set_updated_at();

select public._catalog_rls('testimonials');
-- =============================================================================
-- 20260901120006_leads_newsletter.sql
-- Captura de leads (puente al CRM) y suscriptores de newsletter.
-- El público (anon) SOLO puede insertar. Leer/editar = staff / service_role.
-- Spam / rate-limit se maneja en el front (captcha) o en una Edge Function.
-- =============================================================================

-- =============================================================================
-- leads
-- =============================================================================
create table public.leads (
  id                   uuid primary key default gen_random_uuid(),
  type                 text not null default 'general'
                       check (type in ('accommodation','tour','event','real_estate','general','newsletter')),
  name                 text,
  whatsapp             text,
  email                extensions.citext,
  locale               text default 'es',
  message              text,

  related_type         text check (related_type in ('accommodation','tour','event','real_estate')),
  related_id           uuid,

  check_in             date,
  check_out            date,
  guests               int,
  budget               numeric(14, 2),
  currency             text,
  preferred_dates_note text,

  source               text,
  utm_source           text,
  utm_medium           text,
  utm_campaign         text,
  utm_term             text,
  utm_content          text,
  referrer             text,
  landing_path         text,

  status               text not null default 'new'
                       check (status in ('new','contacted','qualified','won','lost')),
  assigned_to          uuid references public.profiles(id) on delete set null,

  synced_to_crm        boolean not null default false,
  crm_id               text,
  synced_at            timestamptz,

  raw                  jsonb not null default '{}'::jsonb,
  ip                   inet,
  user_agent           text,

  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);
create index leads_status_idx     on public.leads (status);
create index leads_type_idx       on public.leads (type);
create index leads_created_idx    on public.leads (created_at desc);
create index leads_unsynced_idx   on public.leads (synced_to_crm) where not synced_to_crm;
create index leads_related_idx    on public.leads (related_type, related_id);

create trigger trg_leads_updated before update on public.leads
  for each row execute function public.set_updated_at();

alter table public.leads enable row level security;

-- El público puede crear un lead, pero no marcarlo como asignado / sincronizado / cerrado.
create policy "leads_public_insert" on public.leads
  for insert to anon, authenticated
  with check (
    status = 'new'
    and synced_to_crm = false
    and assigned_to is null
    and crm_id is null
  );

create policy "leads_staff_read" on public.leads
  for select to authenticated using (public.is_staff());

create policy "leads_staff_update" on public.leads
  for update to authenticated using (public.is_staff()) with check (public.is_staff());

create policy "leads_admin_delete" on public.leads
  for delete to authenticated using (public.is_admin());

-- =============================================================================
-- newsletter_subscribers
-- =============================================================================
create table public.newsletter_subscribers (
  id                uuid primary key default gen_random_uuid(),
  email             extensions.citext unique not null,
  name              text,
  locale            text default 'es',
  status            text not null default 'pending'
                    check (status in ('pending','subscribed','unsubscribed','bounced','complained')),
  source            text,
  utm_source        text,
  utm_medium        text,
  utm_campaign      text,
  landing_path      text,
  consent_at        timestamptz,
  confirmed_at      timestamptz,
  unsubscribed_at   timestamptz,
  external_provider text check (external_provider in ('mailchimp','brevo','resend','other')),
  external_id       text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index newsletter_status_idx   on public.newsletter_subscribers (status);
create index newsletter_unsynced_idx on public.newsletter_subscribers (external_id) where external_id is null;

create trigger trg_newsletter_updated before update on public.newsletter_subscribers
  for each row execute function public.set_updated_at();

alter table public.newsletter_subscribers enable row level security;

create policy "newsletter_public_insert" on public.newsletter_subscribers
  for insert to anon, authenticated
  with check (status in ('pending','subscribed') and external_id is null);

create policy "newsletter_staff_read" on public.newsletter_subscribers
  for select to authenticated using (public.is_staff());

create policy "newsletter_staff_update" on public.newsletter_subscribers
  for update to authenticated using (public.is_staff()) with check (public.is_staff());
-- =============================================================================
-- 20260901120007_bookings.sql
-- Espejo de reservas para el portal del cliente. El CRM (por construir) es el
-- maestro operativo y escribe vía service_role; aquí el cliente ve calendario,
-- tracking (booking_events) y documentos de SUS reservas.
-- =============================================================================

create sequence if not exists public.bookings_ref_seq;

create table public.bookings (
  id                   uuid primary key default gen_random_uuid(),
  reference            text unique not null
                       default ('TC-' || to_char(now(), 'YYYY') || '-' ||
                                lpad(nextval('public.bookings_ref_seq')::text, 5, '0')),
  user_id              uuid references auth.users(id) on delete set null,
  contact_name         text,
  contact_email        extensions.citext,
  contact_whatsapp     text,

  type                 text not null
                       check (type in ('accommodation','tour','event','package','real_estate_visit')),
  item_type            text check (item_type in ('accommodation','tour','event','real_estate')),
  item_id              uuid,
  item_title_snapshot  text,

  start_date           date,
  end_date             date,
  guests               int,
  pax_detail           jsonb not null default '{}'::jsonb,   -- { "adults": 2, "children": 1 }

  status               text not null default 'pending_payment'
                       check (status in ('draft','pending_payment','confirmed','in_progress','completed','cancelled','no_show')),
  payment_status       text not null default 'unpaid'
                       check (payment_status in ('unpaid','partial','paid','refunded')),
  total_amount         numeric(14, 2),
  paid_amount          numeric(14, 2) not null default 0,
  currency             text not null default 'COP',

  notes                text,
  lead_id              uuid references public.leads(id) on delete set null,
  crm_id               text,
  source               text,

  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);
create index bookings_user_idx    on public.bookings (user_id);
create index bookings_status_idx  on public.bookings (status);
create index bookings_dates_idx   on public.bookings (start_date, end_date);
create index bookings_crm_idx     on public.bookings (crm_id);

create trigger trg_bookings_updated before update on public.bookings
  for each row execute function public.set_updated_at();

alter table public.bookings enable row level security;

create policy "bookings_client_read_own" on public.bookings
  for select to authenticated
  using (user_id = auth.uid() or public.is_staff());

create policy "bookings_staff_write" on public.bookings
  for all to authenticated using (public.is_staff()) with check (public.is_staff());
-- Nota: el CRM escribe con service_role (bypassa RLS).

-- =============================================================================
-- booking_events  (timeline / tracking)
-- =============================================================================
create table public.booking_events (
  id                uuid primary key default gen_random_uuid(),
  booking_id        uuid not null references public.bookings(id) on delete cascade,
  type              text not null default 'custom'
                    check (type in ('created','payment_received','confirmed','message','reminder',
                                    'itinerary_sent','status_changed','cancelled','custom')),
  title             jsonb not null default '{}'::jsonb,
  body              jsonb not null default '{}'::jsonb,
  visible_to_client boolean not null default true,
  created_by        uuid references auth.users(id) on delete set null,
  created_by_role   text not null default 'system'
                    check (created_by_role in ('system','staff','crm','client')),
  created_at        timestamptz not null default now()
);
create index booking_events_parent_idx on public.booking_events (booking_id, created_at);

alter table public.booking_events enable row level security;

create policy "booking_events_client_read" on public.booking_events
  for select to authenticated
  using (
    exists (
      select 1 from public.bookings b
      where b.id = booking_events.booking_id
        and (
          (b.user_id = auth.uid() and booking_events.visible_to_client)
          or public.is_staff()
        )
    )
  );

create policy "booking_events_staff_write" on public.booking_events
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- =============================================================================
-- booking_documents
-- =============================================================================
create table public.booking_documents (
  id                uuid primary key default gen_random_uuid(),
  booking_id        uuid not null references public.bookings(id) on delete cascade,
  kind              text not null default 'other'
                    check (kind in ('voucher','invoice','itinerary','receipt','other')),
  storage_path      text not null,
  label             text,
  visible_to_client boolean not null default true,
  created_at        timestamptz not null default now()
);
create index booking_documents_parent_idx on public.booking_documents (booking_id);

alter table public.booking_documents enable row level security;

create policy "booking_documents_client_read" on public.booking_documents
  for select to authenticated
  using (
    exists (
      select 1 from public.bookings b
      where b.id = booking_documents.booking_id
        and (
          (b.user_id = auth.uid() and booking_documents.visible_to_client)
          or public.is_staff()
        )
    )
  );

create policy "booking_documents_staff_write" on public.booking_documents
  for all to authenticated using (public.is_staff()) with check (public.is_staff());
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
-- =============================================================================
-- 20260901120009_storage.sql
-- Buckets de Supabase Storage y sus políticas.
--   catalog       -> imágenes públicas de catálogo/contenido (lectura pública, escribe staff)
--   avatars       -> foto de perfil (lectura pública, cada quien su carpeta)
--   booking-docs  -> vouchers/facturas (privado: staff / URLs firmadas)
-- =============================================================================

insert into storage.buckets (id, name, public)
values
  ('catalog', 'catalog', true),
  ('avatars', 'avatars', true),
  ('booking-docs', 'booking-docs', false)
on conflict (id) do nothing;

-- --- catalog -----------------------------------------------------------------
create policy "catalog_public_read" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'catalog');

create policy "catalog_staff_write" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'catalog' and public.is_staff());

create policy "catalog_staff_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'catalog' and public.is_staff())
  with check (bucket_id = 'catalog' and public.is_staff());

create policy "catalog_staff_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'catalog' and public.is_staff());

-- --- avatars ----------------------------------------------------------------
-- Estructura de rutas: avatars/<user_id>/<archivo>
create policy "avatars_public_read" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'avatars');

create policy "avatars_owner_write" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "avatars_owner_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "avatars_owner_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- --- booking-docs (privado) ----------------------------------------------
-- El cliente accede mediante URLs firmadas generadas por el backend/CRM.
create policy "booking_docs_staff_read" on storage.objects
  for select to authenticated
  using (bucket_id = 'booking-docs' and public.is_staff());

create policy "booking_docs_staff_write" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'booking-docs' and public.is_staff());

create policy "booking_docs_staff_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'booking-docs' and public.is_staff())
  with check (bucket_id = 'booking-docs' and public.is_staff());

create policy "booking_docs_staff_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'booking-docs' and public.is_staff());
-- =============================================================================
-- 20260901120010_fix_role_trigger.sql
-- Fix: protect_profile_role() revertía CUALQUIER cambio de rol cuando is_admin()
-- era falso, incluyendo service_role / dashboard / SQL editor / migraciones
-- (donde auth.uid() es NULL). Eso impedía promover usuarios desde el panel.
-- Ahora sólo restringe a usuarios finales autenticados que NO son admin.
-- =============================================================================

create or replace function public.protect_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null
     and new.role is distinct from old.role
     and not public.is_admin() then
    new.role := old.role;  -- usuario final sin permiso: se ignora el cambio de rol
  end if;
  return new;
end;
$$;
