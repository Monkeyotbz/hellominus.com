-- =============================================================================
-- 012 — Ajustes del sitio con datos de Hellominus
-- Deja el contacto, la marca, la franja de anuncio y la oferta destacada con los datos de
-- Hellominus en bases que ya tenían otros valores sembrados. Sin número de WhatsApp: el
-- sitio esconde ese canal hasta configurar uno propio (o conectar Zuhay).
-- =============================================================================

update public.site_settings set value = jsonb_build_object(
  'email', 'contacto@hellominus.com',
  'phone', '',
  'whatsapp_number', '',
  'whatsapp_default_text', jsonb_build_object(
    'es', 'Hola, quiero información sobre Hellominus',
    'en', 'Hi, I''d like information about Hellominus'
  ),
  'office_hours', jsonb_build_object('es', 'Cita previa', 'en', 'By appointment')
) where key = 'contact';

update public.site_settings set value = jsonb_build_object(
  'name', 'Hellominus',
  'domain', 'hellominus.com'
) where key = 'brand';

update public.site_settings set value = jsonb_build_object(
  'enabled', false,
  'title', '{}'::jsonb,
  'href', '',
  'image_path', ''
) where key = 'featured_offer';

update public.site_settings set value = jsonb_build_object(
  'enabled', false,
  'text', '{}'::jsonb
) where key = 'announcement_bar';
