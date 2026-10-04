-- =============================================================================
-- 011 — Campos para nómadas digitales en hospedajes
-- La portada (src/home/services/homeService.ts) los lee para filtrar casas
-- "para trabajar". Antes vivían solo en supabase/seed-demo.sql.
-- =============================================================================

alter table public.accommodations add column if not exists wifi_mbps  int;
alter table public.accommodations add column if not exists min_nights int not null default 1;
alter table public.accommodations add column if not exists work_ready boolean not null default false;
