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
