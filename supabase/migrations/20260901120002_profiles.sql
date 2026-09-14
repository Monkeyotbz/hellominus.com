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
