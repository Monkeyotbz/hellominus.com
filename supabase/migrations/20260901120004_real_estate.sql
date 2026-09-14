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
