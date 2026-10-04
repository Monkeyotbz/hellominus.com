-- =============================================================================
-- 013 — Marketplace multitenant
--
-- Cada propietario (hospedajes, tours, mercado) tiene un espacio (`tenants`)
-- que administran sus miembros (`tenant_members`). El catálogo, el blog y los
-- productos llevan `tenant_id`:
--   * tenant_id null      → contenido propio de Hellominus (p. ej. la muestra).
--   * espacio 'pending'   → el propietario prepara su contenido, pero no se ve
--                           en público hasta que un admin aprueba el espacio.
--   * espacio 'active'    → lo que se marca como publicado sale directo.
--
-- Ventas y reservas: las gestiona Zuhay, que se conecta con la service_role
-- (salta RLS) y escribe en `bookings`. Aquí solo se garantiza que el viajero
-- vea lo suyo y el propietario lo de su espacio. Para que Zuhay se entere de
-- espacios nuevos y cambios de catálogo existe la bandeja `integration_events`.
-- =============================================================================

-- --- Espacios -----------------------------------------------------------------
create table public.tenants (
  id                uuid primary key default gen_random_uuid(),
  slug              text unique not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name              text not null,
  kinds             text[] not null default '{}'
                    check (kinds <@ array['hospedaje', 'tours', 'mercado']::text[]),
  status            text not null default 'pending' check (status in ('pending', 'active', 'suspended')),
  tagline           jsonb not null default '{}'::jsonb,
  description       jsonb not null default '{}'::jsonb,
  logo_path         text,
  cover_path        text,
  city              text,
  region            text,
  contact_email     text,
  contact_whatsapp  text,
  website           text,
  social            jsonb not null default '{}'::jsonb,
  -- Ajustes que Zuhay necesita por espacio (canales, ids externos…). Lo escribe Zuhay.
  zuhay_config      jsonb not null default '{}'::jsonb,
  approved_at       timestamptz,
  approved_by       uuid references auth.users(id) on delete set null,
  created_by        uuid references auth.users(id) on delete set null default auth.uid(),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index tenants_status_idx on public.tenants (status);
create trigger trg_tenants_updated before update on public.tenants
  for each row execute function public.set_updated_at();

create table public.tenant_members (
  tenant_id  uuid not null references public.tenants(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  role       text not null default 'owner' check (role in ('owner', 'editor')),
  created_at timestamptz not null default now(),
  primary key (tenant_id, user_id)
);
create index tenant_members_user_idx on public.tenant_members (user_id);

-- --- Helpers de RLS -------------------------------------------------------------
-- security definer: leen tenant_members/tenants sin disparar sus propias políticas.
create or replace function public.my_tenant_ids()
returns setof uuid
language sql stable security definer set search_path = public
as $$
  select tenant_id from public.tenant_members where user_id = auth.uid();
$$;

create or replace function public.is_tenant_member(p_tenant uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.tenant_members where tenant_id = p_tenant and user_id = auth.uid());
$$;

create or replace function public.tenant_is_active(p_tenant uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.tenants where id = p_tenant and status = 'active');
$$;

-- ¿Se puede ver en público una fila con este estado y este dueño?
create or replace function public.is_public_row(p_status text, p_tenant uuid)
returns boolean
language sql stable
as $$
  select p_status = 'published' and (p_tenant is null or public.tenant_is_active(p_tenant));
$$;

alter table public.tenants enable row level security;
alter table public.tenant_members enable row level security;

create policy "tenants_read" on public.tenants
  for select to anon, authenticated
  using (status = 'active' or public.is_tenant_member(id) or public.is_staff());
create policy "tenants_member_update" on public.tenants
  for update to authenticated
  using (public.is_tenant_member(id)) with check (public.is_tenant_member(id));
create policy "tenants_staff_all" on public.tenants
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

create policy "tenant_members_read" on public.tenant_members
  for select to authenticated
  using (user_id = auth.uid() or public.is_tenant_member(tenant_id) or public.is_staff());
create policy "tenant_members_staff_all" on public.tenant_members
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- Un miembro edita el perfil de su espacio, pero no su estado ni la aprobación.
create or replace function public.tenants_guard_fields()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  if auth.uid() is not null and not public.is_staff() then
    if new.status is distinct from old.status
       or new.approved_at is distinct from old.approved_at
       or new.approved_by is distinct from old.approved_by
       or new.slug is distinct from old.slug then
      raise exception 'Solo el equipo de Hellominus puede cambiar el estado o la dirección del espacio';
    end if;
  end if;
  return new;
end;
$$;
create trigger trg_tenants_guard before update on public.tenants
  for each row execute function public.tenants_guard_fields();

-- --- Alta y aprobación ----------------------------------------------------------
-- El propietario crea su espacio (queda 'pending') y queda como dueño.
create or replace function public.create_tenant(
  p_name text,
  p_slug text,
  p_kinds text[],
  p_city text default null,
  p_contact_whatsapp text default null
)
returns public.tenants
language plpgsql security definer set search_path = public
as $$
declare
  t public.tenants;
begin
  if auth.uid() is null then
    raise exception 'Hay que iniciar sesión para crear un espacio';
  end if;
  insert into public.tenants (name, slug, kinds, city, contact_whatsapp, contact_email, created_by)
  values (
    trim(p_name), lower(p_slug), coalesce(p_kinds, '{}'), p_city, p_contact_whatsapp,
    (select email from auth.users where id = auth.uid()), auth.uid()
  )
  returning * into t;
  insert into public.tenant_members (tenant_id, user_id, role) values (t.id, auth.uid(), 'owner');
  return t;
end;
$$;

create or replace function public.set_tenant_status(p_tenant uuid, p_status text)
returns public.tenants
language plpgsql security definer set search_path = public
as $$
declare
  t public.tenants;
begin
  if not public.is_admin() then
    raise exception 'Solo un admin de Hellominus puede aprobar o suspender espacios';
  end if;
  update public.tenants
     set status = p_status,
         approved_at = case when p_status = 'active' then coalesce(approved_at, now()) else approved_at end,
         approved_by = case when p_status = 'active' then coalesce(approved_by, auth.uid()) else approved_by end
   where id = p_tenant
  returning * into t;
  return t;
end;
$$;

revoke all on function public.create_tenant(text, text, text[], text, text) from public, anon;
grant execute on function public.create_tenant(text, text, text[], text, text) to authenticated;
revoke all on function public.set_tenant_status(uuid, text) from public, anon;
grant execute on function public.set_tenant_status(uuid, text) to authenticated;

-- --- Mercado (productos) --------------------------------------------------------
create table public.products (
  id           uuid primary key default gen_random_uuid(),
  tenant_id    uuid references public.tenants(id) on delete cascade,
  slug         text unique not null,
  category     text,
  name         jsonb not null default '{}'::jsonb,
  summary      jsonb not null default '{}'::jsonb,
  description  jsonb not null default '{}'::jsonb,
  price        numeric(12, 2),
  currency     text not null default 'COP',
  stock        int check (stock is null or stock >= 0),
  sku          text,
  status       text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  featured     boolean not null default false,
  sort_order   int not null default 0,
  created_by   uuid references auth.users(id) default auth.uid(),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index products_tenant_idx on public.products (tenant_id);
create index products_status_idx on public.products (status);
create trigger trg_products_updated before update on public.products
  for each row execute function public.set_updated_at();

create table public.product_images (
  id           uuid primary key default gen_random_uuid(),
  product_id   uuid not null references public.products(id) on delete cascade,
  storage_path text not null,
  alt          jsonb not null default '{}'::jsonb,
  sort_order   int not null default 0,
  is_cover     boolean not null default false,
  created_at   timestamptz not null default now()
);
create index product_images_parent_idx on public.product_images (product_id, sort_order);

-- --- Dueño en catálogo y blog ---------------------------------------------------
alter table public.accommodations add column tenant_id uuid references public.tenants(id) on delete cascade;
alter table public.tours          add column tenant_id uuid references public.tenants(id) on delete cascade;
alter table public.events         add column tenant_id uuid references public.tenants(id) on delete cascade;
alter table public.blog_posts     add column tenant_id uuid references public.tenants(id) on delete cascade;
create index accommodations_tenant_idx on public.accommodations (tenant_id);
create index tours_tenant_idx          on public.tours (tenant_id);
create index events_tenant_idx         on public.events (tenant_id);
create index blog_posts_tenant_idx     on public.blog_posts (tenant_id);

-- RLS de tablas con dueño: público ve lo publicado de espacios activos; los
-- miembros ven y editan todo lo de su espacio; el equipo, todo.
create or replace function public._tenant_rls(p_table text, p_extra_public text default 'true')
returns void
language plpgsql
as $$
begin
  execute format('alter table public.%I enable row level security', p_table);
  execute format('drop policy if exists "%1$s_public_read" on public.%1$I', p_table);
  execute format('drop policy if exists "%1$s_staff_write" on public.%1$I', p_table);
  execute format(
    $f$create policy "%1$s_read" on public.%1$I for select to anon, authenticated
       using ((public.is_public_row(status, tenant_id) and %2$s)
              or (tenant_id is not null and public.is_tenant_member(tenant_id))
              or public.is_staff())$f$,
    p_table, p_extra_public);
  execute format(
    $f$create policy "%1$s_member_write" on public.%1$I for all to authenticated
       using (tenant_id is not null and public.is_tenant_member(tenant_id))
       with check (tenant_id is not null and public.is_tenant_member(tenant_id))$f$,
    p_table);
  execute format(
    $f$create policy "%1$s_staff_write" on public.%1$I for all to authenticated
       using (public.is_staff()) with check (public.is_staff())$f$,
    p_table);
end;
$$;

-- Hijas (imágenes, características): siguen la visibilidad y el dueño del padre.
create or replace function public._tenant_child_rls(p_table text, p_parent text, p_fk text)
returns void
language plpgsql
as $$
begin
  execute format('alter table public.%I enable row level security', p_table);
  execute format('drop policy if exists "%1$s_public_read" on public.%1$I', p_table);
  execute format('drop policy if exists "%1$s_staff_write" on public.%1$I', p_table);
  execute format(
    $f$create policy "%1$s_read" on public.%1$I for select to anon, authenticated
       using (exists (select 1 from public.%2$I par where par.id = %3$I
                      and (public.is_public_row(par.status, par.tenant_id)
                           or (par.tenant_id is not null and public.is_tenant_member(par.tenant_id))
                           or public.is_staff())))$f$,
    p_table, p_parent, p_fk);
  execute format(
    $f$create policy "%1$s_member_write" on public.%1$I for all to authenticated
       using (exists (select 1 from public.%2$I par where par.id = %3$I
                      and par.tenant_id is not null and public.is_tenant_member(par.tenant_id)))
       with check (exists (select 1 from public.%2$I par where par.id = %3$I
                      and par.tenant_id is not null and public.is_tenant_member(par.tenant_id)))$f$,
    p_table, p_parent, p_fk);
  execute format(
    $f$create policy "%1$s_staff_write" on public.%1$I for all to authenticated
       using (public.is_staff()) with check (public.is_staff())$f$,
    p_table);
end;
$$;

select public._tenant_rls('accommodations');
select public._tenant_rls('tours');
select public._tenant_rls('events');
select public._tenant_rls('products');
select public._tenant_rls('blog_posts', 'coalesce(published_at, now()) <= now()');

select public._tenant_child_rls('accommodation_images',   'accommodations', 'accommodation_id');
select public._tenant_child_rls('accommodation_features', 'accommodations', 'accommodation_id');
select public._tenant_child_rls('tour_images',            'tours',          'tour_id');
select public._tenant_child_rls('tour_features',          'tours',          'tour_id');
select public._tenant_child_rls('event_images',           'events',         'event_id');
select public._tenant_child_rls('product_images',         'products',       'product_id');

-- --- Fotos por espacio (Storage) -------------------------------------------------
-- Los miembros suben a catalog/tenants/<tenant_id>/…; el resto del bucket es del equipo.
create policy "catalog_member_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'catalog' and (storage.foldername(name))[1] = 'tenants'
              and (storage.foldername(name))[2] in (select id::text from public.my_tenant_ids() as id));
create policy "catalog_member_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'catalog' and (storage.foldername(name))[1] = 'tenants'
         and (storage.foldername(name))[2] in (select id::text from public.my_tenant_ids() as id))
  with check (bucket_id = 'catalog' and (storage.foldername(name))[1] = 'tenants'
              and (storage.foldername(name))[2] in (select id::text from public.my_tenant_ids() as id));
create policy "catalog_member_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'catalog' and (storage.foldername(name))[1] = 'tenants'
         and (storage.foldername(name))[2] in (select id::text from public.my_tenant_ids() as id));

-- --- Reservas y compras (las escribe Zuhay) --------------------------------------
alter table public.bookings add column tenant_id uuid references public.tenants(id) on delete set null;
create index bookings_tenant_idx on public.bookings (tenant_id);
alter table public.bookings alter column reference
  set default ('HM-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.bookings_ref_seq')::text, 5, '0'));
alter table public.bookings drop constraint if exists bookings_type_check;
alter table public.bookings add constraint bookings_type_check
  check (type in ('accommodation', 'tour', 'event', 'package', 'product', 'real_estate_visit'));
alter table public.bookings drop constraint if exists bookings_item_type_check;
alter table public.bookings add constraint bookings_item_type_check
  check (item_type in ('accommodation', 'tour', 'event', 'product', 'real_estate'));

create policy "bookings_tenant_read" on public.bookings
  for select to authenticated
  using (tenant_id is not null and public.is_tenant_member(tenant_id));

-- --- Bandeja para Zuhay -------------------------------------------------------------
-- Zuhay la lee (service_role) y marca processed_at. Así se entera de espacios
-- nuevos, aprobaciones y cambios de catálogo sin consultar todo cada vez.
create table public.integration_events (
  id           bigint generated always as identity primary key,
  topic        text not null,           -- tenant.created | tenant.status_changed | catalog.changed
  tenant_id    uuid,
  entity       text,
  entity_id    uuid,
  payload      jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now(),
  processed_at timestamptz
);
create index integration_events_pending_idx on public.integration_events (id) where processed_at is null;
alter table public.integration_events enable row level security;
create policy "integration_events_staff_read" on public.integration_events
  for select to authenticated using (public.is_staff());

create or replace function public.emit_tenant_event()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.integration_events (topic, tenant_id, entity, entity_id, payload)
    values ('tenant.created', new.id, 'tenants', new.id, jsonb_build_object('slug', new.slug, 'name', new.name, 'status', new.status));
  elsif new.status is distinct from old.status then
    insert into public.integration_events (topic, tenant_id, entity, entity_id, payload)
    values ('tenant.status_changed', new.id, 'tenants', new.id, jsonb_build_object('from', old.status, 'to', new.status));
  end if;
  return new;
end;
$$;
create trigger trg_tenants_events after insert or update on public.tenants
  for each row execute function public.emit_tenant_event();

create or replace function public.emit_catalog_event()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  r record;
begin
  if tg_op = 'DELETE' then r := old; else r := new; end if;
  insert into public.integration_events (topic, tenant_id, entity, entity_id, payload)
  values ('catalog.changed', r.tenant_id, tg_table_name, r.id,
          jsonb_build_object('op', lower(tg_op), 'slug', r.slug, 'status', r.status));
  return null;
end;
$$;
create trigger trg_accommodations_events after insert or update or delete on public.accommodations
  for each row execute function public.emit_catalog_event();
create trigger trg_tours_events after insert or update or delete on public.tours
  for each row execute function public.emit_catalog_event();
create trigger trg_products_events after insert or update or delete on public.products
  for each row execute function public.emit_catalog_event();
