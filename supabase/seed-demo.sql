-- =============================================================================
-- seed-demo.sql  —  CATÁLOGO DE MUESTRA de Hellominus (proyecto hellominus-web).
-- Pegar completo en Supabase > SQL Editor y ejecutar. Se puede repetir: borra y
-- vuelve a crear solo las filas cuyo slug empieza por "demo-".
--
-- Todo vive en este proyecto: las fotos son de stock libre (CC0 / dominio
-- público) y están en Storage, bucket `catalog`, carpeta muestra/.
-- Precios, nombres y textos son inventados.
--
-- BORRAR TODO LO DE MUESTRA cuando lleguen los datos reales:
--   delete from public.tours          where slug like 'demo-%';
--   delete from public.accommodations where slug like 'demo-%';
--   delete from public.destinations   where slug like 'demo-%';
-- =============================================================================

-- --- Campos para nómadas (migración 011; se repiten aquí por si no se aplicó) -
alter table public.accommodations add column if not exists wifi_mbps  int;
alter table public.accommodations add column if not exists min_nights int not null default 1;
alter table public.accommodations add column if not exists work_ready boolean not null default false;

-- --- Limpieza de una ejecución anterior (imágenes y relaciones caen en cascada)
delete from public.tours          where slug like 'demo-%';
delete from public.accommodations where slug like 'demo-%';
delete from public.destinations   where slug like 'demo-%';

-- --- Características (vocabulario global) -----------------------------------
insert into public.features (slug, kind, icon, label, sort_order) values
  ('wifi',       'amenity',        'wifi',      '{"es":"Wi-Fi medido","en":"Tested Wi-Fi"}',                 1),
  ('desk',       'amenity',        'laptop',    '{"es":"Escritorio y silla","en":"Desk and chair"}',        2),
  ('pool',       'amenity',        'waves',     '{"es":"Piscina","en":"Pool"}',                             3),
  ('terrace',    'amenity',        'sun',       '{"es":"Terraza","en":"Terrace"}',                          4),
  ('ac',         'amenity',        'snowflake', '{"es":"Aire acondicionado","en":"Air conditioning"}',      5),
  ('kitchen',    'amenity',        'utensils',  '{"es":"Cocina equipada","en":"Equipped kitchen"}',         6),
  ('transport',  'tour_inclusion', 'bus',       '{"es":"Transporte ida y vuelta","en":"Round-trip transport"}', 10),
  ('guide',      'tour_inclusion', 'user',      '{"es":"Guía local","en":"Local guide"}',                   11),
  ('lunch',      'tour_inclusion', 'utensils',  '{"es":"Almuerzo típico","en":"Local lunch"}',              12)
on conflict (slug) do nothing;

-- --- Destinos ---------------------------------------------------------------
insert into public.destinations (slug, region, hero_image_path, name, tagline, description, status, featured, sort_order)
values
  ('demo-cartagena', 'Bolívar', 'muestra/hero-cartagena.jpg',
    '{"es":"Cartagena","en":"Cartagena"}',
    '{"es":"Mar, ciudad amurallada y atardeceres","en":"Sea, walled city and sunsets"}',
    '{"es":"Islas a una hora en lancha, un centro histórico para caminar y atardeceres desde la terraza.","en":"Islands an hour away by boat, a historic center to walk and sunsets from the terrace."}',
    'published', true, 1),
  ('demo-medellin', 'Antioquia', 'muestra/medellin-ciudad.jpg',
    '{"es":"Medellín","en":"Medellín"}',
    '{"es":"Clima suave y buena señal para trabajar","en":"Mild weather and good signal for working"}',
    '{"es":"La ciudad de la eterna primavera: barrios caminables, cafés y conexión estable para quedarse por meses.","en":"The city of eternal spring: walkable neighborhoods, cafés and stable internet to stay for months."}',
    'published', true, 2),
  ('demo-jardin', 'Antioquia', 'muestra/jardin-campo.jpg',
    '{"es":"Jardín","en":"Jardín"}',
    '{"es":"Café, montañas y pueblo patrimonio","en":"Coffee, mountains and heritage town"}',
    '{"es":"Pueblo patrimonio entre fincas cafeteras y montañas, a tres horas de Medellín.","en":"Heritage town among coffee farms and mountains, three hours from Medellín."}',
    'published', false, 3);

insert into public.destination_images (destination_id, storage_path, alt, sort_order, is_cover)
select d.id, d.hero_image_path, jsonb_build_object('es', d.name->>'es'), 0, true
from public.destinations d
where d.slug like 'demo-%';

-- --- Hospedajes --------------------------------------------------------------
insert into public.accommodations
  (slug, type, destination_id, city, region, price_from, currency, max_guests, bedrooms, beds, bathrooms,
   check_in_time, check_out_time, wifi_mbps, min_nights, work_ready, name, summary, description, location_note,
   status, featured, sort_order)
select v.slug, v.type, d.id, v.city, v.region, v.price, 'COP', v.guests, v.bedrooms, v.beds, v.baths,
       '15:00', '11:00', v.wifi, v.minn, v.work,
       jsonb_build_object('es', v.name_es, 'en', v.name_en),
       jsonb_build_object('es', v.summary_es, 'en', v.summary_en),
       jsonb_build_object('es', v.summary_es, 'en', v.summary_en),
       jsonb_build_object('es', v.area, 'en', v.area),
       'published', v.featured, v.sort
from (values
  ('demo-laguito',      'apartment', 'demo-cartagena', 'Cartagena', 'Bolívar',   320000, 4, 2, 2, 2, 150, 3, true,
    'Apartamento con terraza sobre la laguna', 'Apartment with a terrace over the lagoon',
    'Terraza con hamaca y vista a la laguna del Laguito.', 'Terrace with a hammock overlooking El Laguito lagoon.',
    'El Laguito', true, 1),
  ('demo-torres',       'apartment', 'demo-cartagena', 'Cartagena', 'Bolívar',   290000, 4, 2, 2, 2, 120, 2, true,
    'Balcón frente al agua', 'Waterfront balcony',
    'Balcón con piscina del edificio y vista a la bahía.', 'Balcony with building pool and bay views.',
    'Torres del Lago', true, 2),
  ('demo-bocagrande',   'apartment', 'demo-cartagena', 'Cartagena', 'Bolívar',   270000, 4, 2, 2, 2, 100, 2, false,
    'Apartamento con piscina en la terraza', 'Apartment with a rooftop pool',
    'Piscina con cascada y vista al mar.', 'Pool with a waterfall and sea views.',
    'Bocagrande', false, 3),
  ('demo-conquistador', 'apartment', 'demo-cartagena', 'Cartagena', 'Bolívar',   350000, 5, 2, 3, 2, 100, 3, false,
    'Terraza con vista al mar', 'Terrace with sea view',
    'Terraza amplia con vista al mar y al horizonte.', 'Wide terrace looking out to the sea.',
    'Nuevo Conquistador', false, 4),
  ('demo-poblado',      'apartment', 'demo-medellin',  'Medellín',  'Antioquia', 480000, 6, 3, 4, 3, 300, 5, true,
    'Penthouse con piscina cubierta', 'Penthouse with an indoor pool',
    'Penthouse amplio con piscina cubierta y zonas de trabajo.', 'Spacious penthouse with an indoor pool and work areas.',
    'El Poblado', true, 5),
  ('demo-jardin-finca', 'house',     'demo-jardin',    'Jardín',    'Antioquia', 240000, 6, 3, 4, 2,  50, 2, false,
    'Finca con vista a las montañas', 'Country house with mountain views',
    'Finca entre cafetales y montañas, con jardín y cocina equipada.', 'Farmhouse among coffee fields and mountains, with garden and full kitchen.',
    'Jardín, Antioquia', false, 6)
) as v(slug, type, dest, city, region, price, guests, bedrooms, beds, baths, wifi, minn, work,
       name_es, name_en, summary_es, summary_en, area, featured, sort)
join public.destinations d on d.slug = v.dest;

insert into public.accommodation_images (accommodation_id, storage_path, alt, sort_order, is_cover)
select a.id, v.path, jsonb_build_object('es', v.alt), 0, true
from (values
  ('demo-laguito',      'muestra/sala-vista-agua.jpg',      'Sala con ventanales y vista al agua.'),
  ('demo-torres',       'muestra/balcon-caleta.jpg',       'Caleta de agua turquesa vista desde un balcón.'),
  ('demo-bocagrande',   'muestra/piscinas-aereas.jpg',     'Vista aérea de casas con piscina.'),
  ('demo-conquistador', 'muestra/mar-atardecer.jpg', 'Atardecer naranja sobre el mar con veleros.'),
  ('demo-poblado',      'muestra/comedor-ciudad.jpg',     'Comedor luminoso con ventanales a la ciudad.'),
  ('demo-jardin-finca', 'muestra/finca-corredor.jpg',       'Corredor de finca con plantas y vista al jardín.')
) as v(slug, path, alt)
join public.accommodations a on a.slug = v.slug;

-- Todas: wifi, cocina y aire. Escritorio si es apto para trabajar. Piscina/terraza según el caso.
insert into public.accommodation_features (accommodation_id, feature_id)
select a.id, f.id
from public.accommodations a
join public.features f on f.slug in ('wifi', 'kitchen', 'ac')
   or (f.slug = 'desk' and a.work_ready)
   or (f.slug in ('pool', 'terrace') and a.slug in ('demo-torres', 'demo-bocagrande', 'demo-poblado', 'demo-conquistador'))
   or (f.slug = 'terrace' and a.slug = 'demo-laguito')
where a.slug like 'demo-%'
on conflict do nothing;

-- --- Planes ------------------------------------------------------------------
insert into public.tours
  (slug, destination_id, city, region, category, meeting_point, duration_hours, duration_label, difficulty,
   price_from, currency, min_pax, max_pax, name, summary, description, status, featured, sort_order)
select v.slug, d.id, v.city, v.region, v.category, v.meeting, v.hours,
       jsonb_build_object('es', v.label_es, 'en', v.label_en), v.difficulty, v.price, 'COP', 2, v.max_pax,
       jsonb_build_object('es', v.name_es, 'en', v.name_en),
       jsonb_build_object('es', v.summary_es, 'en', v.summary_en),
       jsonb_build_object('es', v.summary_es, 'en', v.summary_en),
       'published', v.featured, v.sort
from (values
  ('demo-isla-cholon',     'demo-cartagena', 'Cartagena', 'Bolívar',   'Islas y playas', 'Muelle de la Bodeguita, Cartagena', 8, 'Día completo', 'Full day', 'easy', 180000, 20, true,
    'Isla Cholón', 'Cholón Island', 'Día de playa en aguas turquesa.', 'A beach day in turquoise water.', 1),
  ('demo-islas-rosario',   'demo-cartagena', 'Cartagena', 'Bolívar',   'Islas y playas', 'Muelle de la Bodeguita, Cartagena', 9, 'Día completo', 'Full day', 'easy', 240000, 20, true,
    'Islas del Rosario', 'Rosario Islands', 'Cuatro islas en un día, con transporte desde Cartagena.', 'Four islands in one day, with transport from Cartagena.', 2),
  ('demo-bora-bora',       'demo-cartagena', 'Cartagena', 'Bolívar',   'Islas y playas', 'Muelle de la Bodeguita, Cartagena', 8, 'Día completo', 'Full day', 'easy', 220000, 20, true,
    'Bora Bora Beach Club', 'Bora Bora Beach Club', 'Club de playa con camas y servicio.', 'Beach club with loungers and service.', 3),
  ('demo-playa-tranquila', 'demo-cartagena', 'Cartagena', 'Bolívar',   'Islas y playas', 'Muelle de la Bodeguita, Cartagena', 7, 'Medio día', 'Half day', 'easy', 160000, 20, false,
    'Playa Tranquila', 'Playa Tranquila', 'Descanso frente al mar.', 'Downtime by the sea.', 4),
  ('demo-centro-historico','demo-cartagena', 'Cartagena', 'Bolívar',   'Ciudad',         'Torre del Reloj, Cartagena',        3, '3 horas', '3 hours', 'easy', 90000, 15, false,
    'Centro Histórico y Getsemaní a pie', 'Old Town and Getsemaní on foot', 'Balcones, plazas y murales con un guía local.', 'Balconies, squares and murals with a local guide.', 5),
  ('demo-medellin-ciudad', 'demo-medellin',  'Medellín',  'Antioquia', 'Ciudad',         'Parque Lleras, Medellín',           4, '4 horas', '4 hours', 'easy', 120000, 12, true,
    'Medellín en un día', 'Medellín in a day', 'Metrocable, miradores y barrios con historia.', 'Cable car, viewpoints and neighborhoods with history.', 6),
  ('demo-cafe-jardin',     'demo-jardin',    'Jardín',    'Antioquia', 'Naturaleza',     'Parque principal de Jardín',        5, 'Medio día', 'Half day', 'moderate', 140000, 10, false,
    'Día de café en Jardín', 'Coffee day in Jardín', 'Recorrido por una finca cafetera, de la mata a la taza.', 'A coffee farm tour, from plant to cup.', 7)
) as v(slug, dest, city, region, category, meeting, hours, label_es, label_en, difficulty, price, max_pax, featured,
       name_es, name_en, summary_es, summary_en, sort)
join public.destinations d on d.slug = v.dest;

insert into public.tour_images (tour_id, storage_path, alt, sort_order, is_cover)
select t.id, v.path, jsonb_build_object('es', v.alt), 0, true
from (values
  ('demo-isla-cholon',      'muestra/playa-palmeras.jpg',     'Playa de arena blanca bajo las palmeras.'),
  ('demo-islas-rosario',    'muestra/playa-palma-turquesa.jpg',    'Palmera inclinada sobre agua turquesa.'),
  ('demo-bora-bora',        'muestra/playa-club.jpg',       'Playa con sillas a la sombra y lanchas en el agua.'),
  ('demo-playa-tranquila',  'muestra/playa-arena-blanca.jpg',  'Playa de arena blanca al amanecer.'),
  ('demo-centro-historico', 'muestra/cartagena-centro.jpg', 'Calle colonial con balcones de colores en Cartagena.'),
  ('demo-medellin-ciudad',  'muestra/medellin-laderas.jpg','Casas de ladrillo en las laderas de Medellín.'),
  ('demo-cafe-jardin',      'muestra/cafe-secado.jpg','Café secándose al sol en el patio de una finca.')
) as v(slug, path, alt)
join public.tours t on t.slug = v.slug;

insert into public.tour_features (tour_id, feature_id)
select t.id, f.id
from public.tours t
join public.features f on f.slug = 'guide'
   or (f.slug = 'transport' and t.category = 'Islas y playas')
   or (f.slug = 'lunch' and t.duration_hours >= 5)
where t.slug like 'demo-%'
on conflict do nothing;

-- --- Resultado -------------------------------------------------------------
select 'destinos' as tabla, count(*) from public.destinations where slug like 'demo-%'
union all select 'hospedajes', count(*) from public.accommodations where slug like 'demo-%'
union all select 'planes',     count(*) from public.tours          where slug like 'demo-%';
