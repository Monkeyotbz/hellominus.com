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
