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
