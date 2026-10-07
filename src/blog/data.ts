import { foto } from '../home/data';

/**
 * Datos de EJEMPLO del blog y textos de la interfaz en español e inglés.
 * Los artículos de ejemplo se usan mientras la base de datos no tenga
 * artículos publicados. Los reales los redactan agentes de IA y los aprueba
 * una persona (ver planes/blog-hello-minus-plan.md).
 */

export type Lang = 'es' | 'en';
export type Pair = { es: string; en?: string };

export interface BlogCategory {
  slug: string;
  name: Pair;
}

export interface BlogPost {
  slug: string;
  category: string;
  title: Pair;
  excerpt: Pair;
  body: Pair;
  minutes: number;
  image: string;
  alt: string;
  position: string;
  publishedAt: string;
  featured: boolean;
}

/** Cuatro categorías definidas y tres por confirmar (se les cambia el nombre después). */
export const CATEGORIES: BlogCategory[] = [
  { slug: 'destinos', name: { es: 'Destinos en Colombia', en: 'Destinations in Colombia' } },
  { slug: 'viajeros', name: { es: 'Tips viajeros', en: 'Travel tips' } },
  { slug: 'finanzas', name: { es: 'Tips financieros', en: 'Money tips' } },
  { slug: 'nomadas', name: { es: 'Vida nómada', en: 'Nomad life' } },
  { slug: 'por-confirmar-1', name: { es: 'Por confirmar 1', en: 'To be confirmed 1' } },
  { slug: 'por-confirmar-2', name: { es: 'Por confirmar 2', en: 'To be confirmed 2' } },
  { slug: 'por-confirmar-3', name: { es: 'Por confirmar 3', en: 'To be confirmed 3' } },
];

const EJEMPLO: Pair = {
  es: 'Este es un artículo de ejemplo para la maqueta del blog. El contenido real lo redactan agentes de IA y lo revisa una persona antes de publicarlo.\n\nAquí irían los datos, las fuentes y los consejos del tema, con enlaces a los hospedajes y planes relacionados.',
  en: 'This is a sample article for the blog mockup. Real content is written by AI agents and reviewed by a person before it goes live.\n\nThis is where the facts, sources and tips would go, with links to related stays and plans.',
};

const post = (
  slug: string,
  category: string,
  title: Pair,
  excerpt: Pair,
  minutes: number,
  image: string,
  alt: string,
  publishedAt: string,
  featured = false,
  position = '50% 50%',
): BlogPost => ({ slug, category, title, excerpt, body: EJEMPLO, minutes, image, alt, position, publishedAt, featured });

export const POSTS: BlogPost[] = [
  post('islas-del-rosario-un-dia', 'destinos', { es: 'Islas del Rosario: cómo organizar un día con transporte', en: 'Rosario Islands: how to plan a day trip with transport' }, { es: 'Qué incluye el plan, a qué hora salir y qué llevar para aprovechar las cuatro islas.', en: 'What the plan includes, when to leave and what to bring to enjoy all four islands.' }, 6, foto('playa-palma-turquesa'), 'Palmera inclinada sobre agua turquesa.', '2026-10-03', true),
  post('tres-dias-en-cartagena', 'destinos', { es: 'Tres días en Cartagena sin repetir calle', en: 'Three days in Cartagena without repeating a street' }, { es: 'Centro y Getsemaní, para caminar después del trabajo.', en: 'Old town and Getsemaní, for walking after work.' }, 5, foto('cartagena-centro'), 'Calle colonial con balcones de colores en Cartagena.', '2026-09-28', false, '50% 62%'),
  post('jardin-cafe-y-montana', 'destinos', { es: 'Jardín, Antioquia: café, montañas y un pueblo que se camina', en: 'Jardín, Antioquia: coffee, mountains and a walkable town' }, { es: 'Cuándo ir, dónde tomar café y cómo llegar desde Medellín.', en: 'When to go, where to have coffee and how to get there from Medellín.' }, 4, foto('jardin-campo'), 'Casa de campo entre árboles y potreros verdes.', '2026-09-21'),
  post('medellin-barrios-para-un-mes', 'destinos', { es: 'Medellín: barrios para vivir un mes', en: 'Medellín: neighborhoods for a month-long stay' }, { es: 'El Poblado, Laureles y Envigado comparados en señal, ruido y precio.', en: 'El Poblado, Laureles and Envigado compared on signal, noise and price.' }, 7, foto('sala-vista-agua'), 'Sala amplia con vista al agua.', '2026-09-14'),
  post('que-empacar-costa-y-montana', 'viajeros', { es: 'Qué empacar para costa y para montaña', en: 'What to pack for the coast and the mountains' }, { es: 'Una lista corta para clima cálido, lluvia y noches frescas.', en: 'A short list for warm weather, rain and cool nights.' }, 4, foto('playa-club'), 'Playa con sillas a la sombra y lanchas en el agua.', '2026-09-10'),
  post('fin-de-semana-en-la-montana', 'viajeros', { es: 'Un fin de semana en la montaña, con café incluido', en: 'A weekend in the mountains, coffee included' }, { es: 'Cabañas y miradores a pocas horas de la ciudad.', en: 'Cabins and viewpoints a few hours from the city.' }, 4, foto('finca-corredor'), 'Corredor de una finca con vista al campo.', '2026-09-05'),
  post('cuanto-cuesta-vivir-un-mes', 'finanzas', { es: 'Cuánto cuesta vivir un mes en Medellín y en Cartagena', en: 'What a month costs in Medellín and Cartagena' }, { es: 'Arriendo, comida, transporte y coworking, con rangos en pesos.', en: 'Rent, food, transport and coworking, with ranges in pesos.' }, 7, foto('trabajo-portatil'), 'Portátil sobre una mesa junto a una planta.', '2026-08-30'),
  post('pesos-o-dolares-al-reservar', 'finanzas', { es: 'Pagar en pesos o en dólares: qué conviene al reservar', en: 'Paying in pesos or dollars: what works best when booking' }, { es: 'Tasa de cambio, comisiones y cuándo cobra cada medio de pago.', en: 'Exchange rate, fees and when each payment method charges you.' }, 5, foto('balcon-caleta'), 'Balcón frente a una caleta.', '2026-08-25'),
  post('presupuestar-una-estadia-larga', 'finanzas', { es: 'Cómo presupuestar una estadía larga', en: 'How to budget for a long stay' }, { es: 'Tarifa mensual, servicios incluidos y gastos que se olvidan.', en: 'Monthly rate, included services and costs people forget.' }, 6, foto('piscinas-aereas'), 'Vista aérea de piscinas en la costa.', '2026-08-20'),
  post('wifi-medido-antes-de-reservar', 'nomadas', { es: 'Wi-Fi medido: cómo probar la conexión antes de reservar', en: 'Tested Wi-Fi: how to check the connection before you book' }, { es: 'Tres pruebas de dos minutos que evitan sorpresas en una reunión.', en: 'Three two-minute tests that avoid surprises in a meeting.' }, 5, foto('mar-atardecer'), 'Atardecer sobre el mar.', '2026-08-15'),
];

export const AUTHOR: Pair = { es: 'Redacción Hellominus', en: 'Hellominus editorial team' };
export const AUTHOR_NOTE: Pair = { es: 'Escrito con IA y revisado por una persona', en: 'Written with AI and reviewed by a person' };

export const UI: Record<Lang, Record<string, string>> = {
  es: {
    all: 'Todo',
    blog: 'Blog',
    featured: 'artículo destacado',
    recent: 'Lo más reciente',
    published: 'Publicado el',
    by: 'por',
    reading: 'Tiempo de lectura',
    minutes: 'minutos',
    readMore: 'Read more · Leer más',
    article: 'artículo',
    articles: 'artículos',
    emptyCat: 'Aún no hay artículos en esta categoría.',
    example: 'Artículos, fotos y autores de ejemplo.',
    menu: 'Menú',
    search: 'Buscar en el blog',
    searchPlaceholder: 'Buscar un tema…',
    publish: 'Publicar mi hospedaje',
    signIn: 'Iniciar sesión',
    reserve: 'Reservar',
    translate: 'Traducir a inglés',
    untranslate: 'Ver en español',
    pending: 'Traducción pendiente: se muestra en español.',
    back: 'Volver al blog',
    stays: 'Estadías',
    plans: 'Planes y mercado',
    market: 'Marketplace',
    nomads: 'Para nómadas',
    allStays: 'Todos los hospedajes',
    allTours: 'Todos los tours',
    about: 'Nosotros',
    loading: 'Cargando artículos…',
    notFound: 'No encontramos este artículo.',
  },
  en: {
    all: 'All',
    blog: 'Blog',
    featured: 'featured article',
    recent: 'Latest',
    published: 'Published',
    by: 'by',
    reading: 'Reading time',
    minutes: 'minutes',
    readMore: 'Read more · Leer más',
    article: 'article',
    articles: 'articles',
    emptyCat: 'There are no articles in this category yet.',
    example: 'Sample articles, photos and authors.',
    menu: 'Menu',
    search: 'Search the blog',
    searchPlaceholder: 'Search a topic…',
    publish: 'List my property',
    signIn: 'Sign in',
    reserve: 'Book',
    translate: 'Translate to English',
    untranslate: 'Ver en español',
    pending: 'Translation pending: shown in Spanish.',
    back: 'Back to the blog',
    stays: 'Stays',
    plans: 'Plans and market',
    market: 'Marketplace',
    nomads: 'For nomads',
    allStays: 'All stays',
    allTours: 'All tours',
    about: 'About',
    loading: 'Loading articles…',
    notFound: 'We could not find this article.',
  },
};

export const pick = (value: Pair, lang: Lang): string => (lang === 'en' && value.en ? value.en : value.es);
export const hasTranslation = (value: Pair): boolean => Boolean(value.en && value.en.trim());

export function formatDate(iso: string, lang: Lang): string {
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString(lang === 'en' ? 'en-US' : 'es-CO', { day: 'numeric', month: 'long', year: 'numeric' });
}
