-- Ejecutar en el SQL Editor de un proyecto Supabase NUEVO y dedicado a
-- Hellominus como negocio (NO el proyecto de KAIROS que usa
-- agents/linkedin-agent). Ver supabase/README.md para el paso a paso.

create table if not exists leads (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  nombre text not null,
  email text not null,
  empresa text,
  sector text check (sector in ('construccion', 'derecho', 'ventas', 'cobranza', 'otro')),
  resumen text not null,
  transcripcion jsonb not null,
  estado text not null default 'nuevo' check (estado in ('nuevo', 'contactado', 'agendado', 'descartado')),
  fuente text not null default 'chat_web'
);

create index if not exists idx_leads_estado on leads (estado);
create index if not exists idx_leads_created_at on leads (created_at desc);

-- Row Level Security queda activo sin policies públicas: el backend
-- (api/chat.js) accede con la service_role key, que bypassa RLS. Esto es
-- defensa en profundidad por si alguna vez se filtra la clave "anon".
alter table leads enable row level security;
