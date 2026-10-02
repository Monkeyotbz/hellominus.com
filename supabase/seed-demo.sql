-- =============================================================================
-- seed-demo.sql  —  DATOS DE EJEMPLO para el MVP (casas, planes y destinos).
-- Pegar completo en Supabase > SQL Editor y ejecutar. Se puede repetir: borra y
-- vuelve a crear solo las filas cuyo slug empieza por "demo-".
--
-- BORRAR TODO LO DE EJEMPLO cuando lleguen los datos reales:
--   delete from public.tours          where slug like 'demo-%';
--   delete from public.accommodations where slug like 'demo-%';
--   delete from public.destinations   where slug like 'demo-%';
--
-- Las fotos son archivos públicos del sitio (carpeta public/home): no hay que
-- subir nada a Storage. Precios, nombres y textos son inventados.
-- =============================================================================

-- --- Campos que necesita la portada para nómadas (columnas nuevas) ---------
alter table public.accommodations add column if not exists wifi_mbps  int;
alter table public.accommodations add column if not exists min_nights int not null default 1;
alter table public.accommodations add column if not exists work_ready boolean not null default false;

-- --- Limpieza de una ejecución anterior ------------------------------------
delete from public.tours          where slug like 'demo-%';
delete from public.accommodations where slug like 'demo-%';
delete from public.destinations   where slug like 'demo-%';

-- --- Características (vocabulario) -----------------------------------------
insert into public.features (slug, kind, icon, label, sort_order) values
  ('wifi',     'amenity', 'wifi',     '{"es":"Wi-Fi medido","en":"Tested Wi-Fi"}',          1),
  ('desk',     'amenity', 'laptop',   '{"es":"Escritorio y silla","en":"Desk and chair"}', 2),
  ('pool',     'amenity', 'waves',    '{"es":"Piscina","en":"Pool"}',                      3),
  ('terrace',  'amenity', 'sun',      '{"es":"Terraza","en":"Terrace"}',                   4),
  ('ac',       'amenity', 'snowflake','{"es":"Aire acondicionado","en":"Air conditioning"}', 5),
  ('kitchen',  'amenity', 'utensils', '{"es":"Cocina equipada","en":"Equipped kitchen"}',  6)
on conflict (slug) do nothing;

-- --- Destinos ---------------------------------------------------------------
insert into public.destinations (slug, region, hero_image_path, name, tagline, description, status, featured, sort_order) values
  ('demo-cartagena', 'Bolívar',   '/home/hero-atardecer.jpg',
    '{"es":"Cartagena","en":"Cartagena"}',
    '{"es":"Mar, ciudad amurallada y atardeceres","en":"Sea, walled city and sunsets"}',
    '{"es":"Destino de ejemplo para la maqueta.","en":"Sample destination for the mockup."}', 'published', true, 1),
  ('demo-medellin',  'Antioquia', '/home/feat-medellin.jpg',
    '{"es":"Medellín","en":"Medellín"}',
    '{"es":"Clima suave y buena señal para trabajar","en":"Mild weather and good signal for working"}',
    '{"es":"Destino de ejemplo para la maqueta.","en":"Sample destination for the mockup."}', 'published', true, 2),
  ('demo-jardin',    'Antioquia', '/home/p-jardin.jpg',
    '{"es":"Jardín","en":"Jardín"}',
    '{"es":"Café, montañas y pueblo patrimonio","en":"Coffee, mountains and heritage town"}',
    '{"es":"Destino de ejemplo para la maqueta.","en":"Sample destination for the mockup."}', 'published', false, 3);

-- --- Casas -----------------------------------------------------------------
insert into public.accommodations
  (slug, type, destination_id, city, region, price_from, currency, max_guests, bedrooms, beds, bathrooms,
   check_in_time, check_out_time, wifi_mbps, min_nights, work_ready, name, summary, description, location_note, status, featured, sort_order)
select v.slug, v.type, d.id, v.city, v.region, v.price, 'COP', v.guests, v.bedrooms, v.beds, v.baths,
       '15:00', '11:00', v.wifi, v.minn, v.work,
       jsonb_build_object('es', v.name_es, 'en', v.name_en),
       jsonb_build_object('es', v.summary_es),
       jsonb_build_object('es', v.summary_es || ' Casa de ejemplo para la maqueta del MVP.'),
       jsonb_build_object('es', v.area),
       'published', v.featured, v.sort
from (values
  ('demo-laguito',      'apartment', 'demo-cartagena', 'Cartagena', 'Bolívar',   320000, 4, 2, 2, 2, 150, 3, true,  'Apartamento con terraza sobre la laguna', 'Apartment with a terrace over the lagoon', 'Terraza con hamaca y vista a la laguna del Laguito.', 'El Laguito', true, 1),
  ('demo-torres',       'apartment', 'demo-cartagena', 'Cartagena', 'Bolívar',   290000, 4, 2, 2, 2, 120, 2, true,  'Balcón frente al agua', 'Waterfront balcony', 'Balcón con piscina del edificio y vista a la bahía.', 'Torres del Lago', true, 2),
  ('demo-bocagrande',   'apartment', 'demo-cartagena', 'Cartagena', 'Bolívar',   270000, 4, 2, 2, 2, 100, 2, false, 'Apartamento con piscina en la terraza', 'Apartment with a rooftop pool', 'Piscina con cascada y vista al mar.', 'Bocagrande', false, 3),
  ('demo-conquistador', 'apartment', 'demo-cartagena', 'Cartagena', 'Bolívar',   350000, 5, 2, 3, 2, 100, 3, false, 'Terraza con vista al mar', 'Terrace with sea view', 'Terraza amplia con vista al mar y al horizonte.', 'Nuevo Conquistador', false, 4),
  ('demo-poblado',      'apartment', 'demo-medellin',  'Medellín',  'Antioquia', 480000, 6, 3, 4, 3, 300, 5, true,  'Penthouse con piscina cubierta', 'Penthouse with an indoor pool', 'Penthouse amplio con piscina cubierta y zonas de trabajo.', 'El Poblado', true, 5),
  ('demo-jardin-casa',  'house',     'demo-jardin',    'Jardín',    'Antioquia', 240000, 6, 3, 4, 2,  50, 2, false, 'Casa de campo con vista a las montañas', 'Country house with mountain views', 'Casa de campo entre café y montañas.', 'Jardín, Antioquia', false, 6)
) as v(slug, type, dest, city, region, price, guests, bedrooms, beds, baths, wifi, minn, work, name_es, name_en, summary_es, area, featured, sort)
join public.destinations d on d.slug = v.dest;

-- Una foto de portada por casa
insert into public.accommodation_images (accommodation_id, storage_path, alt, sort_order, is_cover)
select a.id, v.path, jsonb_build_object('es', v.alt), 0, true
from (values
  ('demo-laguito',      '/home/p-laguito.jpg',      'Terraza con hamaca y vista a la laguna del Laguito.'),
  ('demo-torres',       '/home/p-torres.jpg',       'Balcón con piscina y vista a la bahía.'),
  ('demo-bocagrande',   '/home/p-palmetto.jpg',     'Piscina con cascada y vista al mar.'),
  ('demo-conquistador', '/home/p-conquistador.jpg', 'Terraza amplia con vista al mar y al horizonte.'),
  ('demo-poblado',      '/home/p-medellin.jpg',     'Penthouse con piscina cubierta.'),
  ('demo-jardin-casa',  '/home/p-jardin.jpg',       'Casa de campo entre café y montañas.')
) as v(slug, path, alt)
join public.accommodations a on a.slug = v.slug;

-- Características de cada casa
insert into public.accommodation_features (accommodation_id, feature_id)
select a.id, f.id
from public.accommodations a
join public.features f on f.slug in ('wifi', 'kitchen', 'ac')
where a.slug like 'demo-%'
on conflict do nothing;

insert into public.accommodation_features (accommodation_id, feature_id)
select a.id, f.id
from public.accommodations a
join public.features f on f.slug = 'desk'
where a.slug like 'demo-%' and a.work_ready
on conflict do nothing;

insert into public.accommodation_features (accommodation_id, feature_id)
select a.id, f.id
from public.accommodations a
join public.features f on f.slug in ('pool', 'terrace')
where a.slug in ('demo-torres', 'demo-bocagrande', 'demo-poblado', 'demo-conquistador')
on conflict do nothing;

-- --- Planes de turismo ------------------------------------------------------
insert into public.tours
  (slug, destination_id, city, region, category, meeting_point, duration_hours, duration_label, difficulty,
   price_from, currency, min_pax, max_pax, name, summary, description, status, featured, sort_order)
select v.slug, d.id, 'Cartagena', 'Bolívar', v.category, 'Muelle de la Bodeguita, Cartagena', v.hours,
       jsonb_build_object('es', v.label), 'easy', v.price, 'COP', 2, 20,
       jsonb_build_object('es', v.name_es),
       jsonb_build_object('es', v.summary_es),
       jsonb_build_object('es', v.summary_es || ' Plan de ejemplo para la maqueta del MVP.'),
       'published', true, v.sort
from (values
  ('demo-isla-cholon',     'Isla Cholón',          'Islas y playas', 8, 'Día completo',   180000, 'Día de playa en aguas turquesa.', 1),
  ('demo-islas-rosario',   'Islas del Rosario',    'Islas y playas', 9, 'Día completo',   240000, 'Cuatro islas en un día, con transporte desde Cartagena.', 2),
  ('demo-bora-bora',       'Bora Bora Beach Club', 'Islas y playas', 8, 'Día completo',   220000, 'Club de playa con camas y servicio.', 3),
  ('demo-playa-tranquila', 'Playa Tranquila',      'Islas y playas', 7, 'Medio día',      160000, 'Descanso frente al mar.', 4)
) as v(slug, name_es, category, hours, label, price, summary_es, sort)
join public.destinations d on d.slug = 'demo-cartagena';

insert into public.tour_images (tour_id, storage_path, alt, sort_order, is_cover)
select t.id, v.path, jsonb_build_object('es', v.alt), 0, true
from (values
  ('demo-isla-cholon',     '/home/t-cholon.jpg',    'Isla Cholón, aguas turquesa y botes.'),
  ('demo-islas-rosario',   '/home/t-rosario.jpg',   'Isla de las Islas del Rosario con arrecife turquesa.'),
  ('demo-bora-bora',       '/home/t-bora.jpg',      'Club de playa con sombrillas de colores.'),
  ('demo-playa-tranquila', '/home/t-tranquila.jpg', 'Playa Tranquila con arena blanca.')
) as v(slug, path, alt)
join public.tours t on t.slug = v.slug;

-- --- Resultado -------------------------------------------------------------
select 'destinos' as tabla, count(*) from public.destinations where slug like 'demo-%'
union all select 'casas',  count(*) from public.accommodations where slug like 'demo-%'
union all select 'planes', count(*) from public.tours          where slug like 'demo-%';
