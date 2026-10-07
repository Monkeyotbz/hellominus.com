-- =============================================================================
-- seed-blog.sql: categorías del blog y 10 artículos de EJEMPLO.
-- Pegar completo en Supabase > SQL Editor. Se puede repetir.
-- Las 3 categorías "Por confirmar" son provisionales: se les cambia el nombre luego.
-- Los artículos llevan slug demo-* para borrarlos cuando haya contenido real:
--   delete from public.blog_posts where slug like 'demo-%';
-- Las fotos son las del catálogo de muestra (bucket catalog, carpeta muestra/).
-- =============================================================================

insert into public.blog_categories (slug, name, sort_order) values
  ('destinos', jsonb_build_object('es', 'Destinos en Colombia', 'en', 'Destinations in Colombia'), 0),
  ('viajeros', jsonb_build_object('es', 'Tips viajeros', 'en', 'Travel tips'), 1),
  ('finanzas', jsonb_build_object('es', 'Tips financieros', 'en', 'Money tips'), 2),
  ('nomadas', jsonb_build_object('es', 'Vida nómada', 'en', 'Nomad life'), 3),
  ('por-confirmar-1', jsonb_build_object('es', 'Por confirmar 1', 'en', 'To be confirmed 1'), 4),
  ('por-confirmar-2', jsonb_build_object('es', 'Por confirmar 2', 'en', 'To be confirmed 2'), 5),
  ('por-confirmar-3', jsonb_build_object('es', 'Por confirmar 3', 'en', 'To be confirmed 3'), 6)
on conflict (slug) do update set name = excluded.name, sort_order = excluded.sort_order;

delete from public.blog_posts where slug like 'demo-%';

insert into public.blog_posts (slug, category_id, cover_image_path, reading_minutes, title, excerpt, body, status, featured, published_at)
select v.slug, c.id, v.cover, v.minutes, jsonb_build_object('es', v.t_es, 'en', v.t_en), jsonb_build_object('es', v.e_es, 'en', v.e_en),
       jsonb_build_object('es', 'Este es un artículo de ejemplo para la maqueta del blog. El contenido real lo redactan agentes de IA y lo revisa una persona antes de publicarlo.

Aquí irían los datos, las fuentes y los consejos del tema, con enlaces a los hospedajes y planes relacionados.', 'en', 'This is a sample article for the blog mockup. Real content is written by AI agents and reviewed by a person before it goes live.

This is where the facts, sources and tips would go, with links to related stays and plans.'), 'published', v.featured, v.published_at::timestamptz
from (values
  ('demo-islas-del-rosario-un-dia', 'destinos', 'muestra/playa-palma-turquesa.jpg', 6::int, 'Islas del Rosario: cómo organizar un día con transporte', 'Rosario Islands: how to plan a day trip with transport', 'Qué incluye el plan, a qué hora salir y qué llevar para aprovechar las cuatro islas.', 'What the plan includes, when to leave and what to bring to enjoy all four islands.', true::boolean, '2026-10-03'),
  ('demo-tres-dias-en-cartagena', 'destinos', 'muestra/cartagena-centro.jpg', 5::int, 'Tres días en Cartagena sin repetir calle', 'Three days in Cartagena without repeating a street', 'Centro y Getsemaní, para caminar después del trabajo.', 'Old town and Getsemaní, for walking after work.', false::boolean, '2026-09-28'),
  ('demo-jardin-cafe-y-montana', 'destinos', 'muestra/jardin-campo.jpg', 4::int, 'Jardín, Antioquia: café, montañas y un pueblo que se camina', 'Jardín, Antioquia: coffee, mountains and a walkable town', 'Cuándo ir, dónde tomar café y cómo llegar desde Medellín.', 'When to go, where to have coffee and how to get there from Medellín.', false::boolean, '2026-09-21'),
  ('demo-medellin-barrios-para-un-mes', 'destinos', 'muestra/sala-vista-agua.jpg', 7::int, 'Medellín: barrios para vivir un mes', 'Medellín: neighborhoods for a month-long stay', 'El Poblado, Laureles y Envigado comparados en señal, ruido y precio.', 'El Poblado, Laureles and Envigado compared on signal, noise and price.', false::boolean, '2026-09-14'),
  ('demo-que-empacar-costa-y-montana', 'viajeros', 'muestra/playa-club.jpg', 4::int, 'Qué empacar para costa y para montaña', 'What to pack for the coast and the mountains', 'Una lista corta para clima cálido, lluvia y noches frescas.', 'A short list for warm weather, rain and cool nights.', false::boolean, '2026-09-10'),
  ('demo-fin-de-semana-en-la-montana', 'viajeros', 'muestra/finca-corredor.jpg', 4::int, 'Un fin de semana en la montaña, con café incluido', 'A weekend in the mountains, coffee included', 'Cabañas y miradores a pocas horas de la ciudad.', 'Cabins and viewpoints a few hours from the city.', false::boolean, '2026-09-05'),
  ('demo-cuanto-cuesta-vivir-un-mes', 'finanzas', 'muestra/trabajo-portatil.jpg', 7::int, 'Cuánto cuesta vivir un mes en Medellín y en Cartagena', 'What a month costs in Medellín and Cartagena', 'Arriendo, comida, transporte y coworking, con rangos en pesos.', 'Rent, food, transport and coworking, with ranges in pesos.', false::boolean, '2026-08-30'),
  ('demo-pesos-o-dolares-al-reservar', 'finanzas', 'muestra/balcon-caleta.jpg', 5::int, 'Pagar en pesos o en dólares: qué conviene al reservar', 'Paying in pesos or dollars: what works best when booking', 'Tasa de cambio, comisiones y cuándo cobra cada medio de pago.', 'Exchange rate, fees and when each payment method charges you.', false::boolean, '2026-08-25'),
  ('demo-presupuestar-una-estadia-larga', 'finanzas', 'muestra/piscinas-aereas.jpg', 6::int, 'Cómo presupuestar una estadía larga', 'How to budget for a long stay', 'Tarifa mensual, servicios incluidos y gastos que se olvidan.', 'Monthly rate, included services and costs people forget.', false::boolean, '2026-08-20'),
  ('demo-wifi-medido-antes-de-reservar', 'nomadas', 'muestra/mar-atardecer.jpg', 5::int, 'Wi-Fi medido: cómo probar la conexión antes de reservar', 'Tested Wi-Fi: how to check the connection before you book', 'Tres pruebas de dos minutos que evitan sorpresas en una reunión.', 'Three two-minute tests that avoid surprises in a meeting.', false::boolean, '2026-08-15')
) as v(slug, cat, cover, minutes, t_es, t_en, e_es, e_en, featured, published_at)
join public.blog_categories c on c.slug = v.cat;

select (select count(*) from public.blog_categories) as categorias, (select count(*) from public.blog_posts where slug like 'demo-%') as articulos;
