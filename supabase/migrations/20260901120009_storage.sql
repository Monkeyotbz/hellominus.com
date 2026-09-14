-- =============================================================================
-- 20260901120009_storage.sql
-- Buckets de Supabase Storage y sus políticas.
--   catalog       -> imágenes públicas de catálogo/contenido (lectura pública, escribe staff)
--   avatars       -> foto de perfil (lectura pública, cada quien su carpeta)
--   booking-docs  -> vouchers/facturas (privado: staff / URLs firmadas)
-- =============================================================================

insert into storage.buckets (id, name, public)
values
  ('catalog', 'catalog', true),
  ('avatars', 'avatars', true),
  ('booking-docs', 'booking-docs', false)
on conflict (id) do nothing;

-- --- catalog -----------------------------------------------------------------
create policy "catalog_public_read" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'catalog');

create policy "catalog_staff_write" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'catalog' and public.is_staff());

create policy "catalog_staff_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'catalog' and public.is_staff())
  with check (bucket_id = 'catalog' and public.is_staff());

create policy "catalog_staff_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'catalog' and public.is_staff());

-- --- avatars ----------------------------------------------------------------
-- Estructura de rutas: avatars/<user_id>/<archivo>
create policy "avatars_public_read" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'avatars');

create policy "avatars_owner_write" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "avatars_owner_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "avatars_owner_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- --- booking-docs (privado) ----------------------------------------------
-- El cliente accede mediante URLs firmadas generadas por el backend/CRM.
create policy "booking_docs_staff_read" on storage.objects
  for select to authenticated
  using (bucket_id = 'booking-docs' and public.is_staff());

create policy "booking_docs_staff_write" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'booking-docs' and public.is_staff());

create policy "booking_docs_staff_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'booking-docs' and public.is_staff())
  with check (bucket_id = 'booking-docs' and public.is_staff());

create policy "booking_docs_staff_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'booking-docs' and public.is_staff());
