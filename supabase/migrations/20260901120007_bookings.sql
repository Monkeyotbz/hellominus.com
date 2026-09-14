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
