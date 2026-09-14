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
