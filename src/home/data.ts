/**
 * Datos de EJEMPLO de la portada. Nada de esto es real: precios, cifras,
 * reseñas, políticas y artículos se reemplazan cuando existan los datos
 * verdaderos. Las fotos son de stock libre (CC0) en el bucket `catalog` de
 * Supabase, carpeta muestra/.
 */

import { catalogImageUrl } from '../lib/supabase';

/** URL pública de una foto de muestra (catalog/muestra/<nombre>.jpg). */
export const foto = (nombre: string) => catalogImageUrl(`muestra/${nombre}.jpg`);

export type City = 'Cartagena' | 'Medellín' | 'Jardín';
export type StayFilter = 'todas' | City | 'trabajo';

export interface Property {
  id: string;
  /** Slug de la ficha: /hospedajes/<slug>. */
  slug: string;
  city: City;
  area: string;
  title: string;
  image: string;
  alt: string;
  tag: string;
  wifiMbps: number;
  minNights: number;
  pricePerNight: number;
  forWork: boolean;
}

export interface Plan {
  id: string;
  title: string;
  detail: string;
  price: number;
  image: string;
  alt: string;
}

export interface Product {
  id: string;
  kind: string;
  title: string;
  detail: string;
  price: number;
}

export interface Review {
  id: string;
  quote: string;
  author: string;
}

export interface Post {
  id: string;
  topic: string;
  minutes: number;
  title: string;
  excerpt: string;
  image: string;
  alt: string;
  position: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export const CITIES: City[] = ['Cartagena', 'Medellín', 'Jardín'];

export const PROPERTIES: Property[] = [
  {
    id: 'laguito',
    slug: 'demo-laguito',
    city: 'Cartagena',
    area: 'El Laguito',
    title: 'Apartamento con terraza sobre la laguna',
    image: foto('sala-vista-agua'),
    alt: 'Sala con ventanales y vista al agua.',
    tag: 'Vista a la laguna',
    wifiMbps: 150,
    minNights: 3,
    pricePerNight: 320000,
    forWork: true,
  },
  {
    id: 'torres',
    slug: 'demo-torres',
    city: 'Cartagena',
    area: 'Torres del Lago',
    title: 'Balcón frente al agua',
    image: foto('balcon-caleta'),
    alt: 'Caleta de agua turquesa vista desde un balcón.',
    tag: 'Piscina del edificio',
    wifiMbps: 120,
    minNights: 2,
    pricePerNight: 290000,
    forWork: true,
  },
  {
    id: 'bocagrande',
    slug: 'demo-bocagrande',
    city: 'Cartagena',
    area: 'Bocagrande',
    title: 'Apartamento con piscina en la terraza',
    image: foto('piscinas-aereas'),
    alt: 'Vista aérea de casas con piscina.',
    tag: 'Piscina',
    wifiMbps: 100,
    minNights: 2,
    pricePerNight: 270000,
    forWork: false,
  },
  {
    id: 'conquistador',
    slug: 'demo-conquistador',
    city: 'Cartagena',
    area: 'Nuevo Conquistador',
    title: 'Terraza con vista al mar',
    image: foto('mar-atardecer'),
    alt: 'Atardecer naranja sobre el mar con veleros.',
    tag: 'Frente al mar',
    wifiMbps: 100,
    minNights: 3,
    pricePerNight: 350000,
    forWork: false,
  },
  {
    id: 'poblado',
    slug: 'demo-poblado',
    city: 'Medellín',
    area: 'El Poblado',
    title: 'Penthouse con piscina cubierta',
    image: foto('comedor-ciudad'),
    alt: 'Comedor luminoso con ventanales a la ciudad.',
    tag: 'Piscina cubierta',
    wifiMbps: 300,
    minNights: 5,
    pricePerNight: 480000,
    forWork: true,
  },
  {
    id: 'jardin',
    slug: 'demo-jardin-finca',
    city: 'Jardín',
    area: 'Antioquia',
    title: 'Casa de campo con vista a las montañas',
    image: foto('finca-corredor'),
    alt: 'Corredor de finca con plantas y vista al jardín.',
    tag: 'Montaña',
    wifiMbps: 50,
    minNights: 2,
    pricePerNight: 240000,
    forWork: false,
  },
];

export const FEATURED_PROPERTY_ID = 'poblado';

export const PLANS: Plan[] = [
  { id: 'cholon', title: 'Isla Cholón', detail: 'Día de playa', price: 180000, image: foto('playa-palmeras'), alt: 'Playa de arena blanca bajo las palmeras.' },
  { id: 'rosario', title: 'Islas del Rosario', detail: 'Cuatro islas', price: 240000, image: foto('playa-palma-turquesa'), alt: 'Palmera inclinada sobre agua turquesa.' },
  { id: 'bora', title: 'Bora Bora Beach Club', detail: 'Club de playa', price: 220000, image: foto('playa-club'), alt: 'Playa con sillas a la sombra y lanchas en el agua.' },
  { id: 'tranquila', title: 'Playa Tranquila', detail: 'Descanso', price: 160000, image: foto('playa-arena-blanca'), alt: 'Playa de arena blanca al amanecer.' },
];

export const PRODUCTS: Product[] = [
  { id: 'tote', kind: 'tela', title: 'Tote bag de lino', detail: 'Hecha en Medellín', price: 95000 },
  { id: 'cafe', kind: 'café', title: 'Café de origen, 340 g', detail: 'Antioquia', price: 42000 },
  { id: 'taza', kind: 'cerámica', title: 'Taza hecha a mano', detail: 'Ráquira', price: 58000 },
  { id: 'gorra', kind: 'tejido', title: 'Gorra de iraca', detail: 'Sandoná', price: 78000 },
];

export const REVIEWS: Review[] = [
  { id: 'r1', quote: 'Trabajé cinco semanas desde la terraza. La conexión nunca se cayó en una reunión.', author: 'Lucas, desarrollador de software' },
  { id: 'r2', quote: 'Reservé el hospedaje y el plan a las islas en un solo paso.', author: 'Marta, de visita desde Bogotá' },
  { id: 'r3', quote: 'Llegué por una semana y me quedé un mes.', author: 'Ana, diseñadora' },
];

export const POSTS: Post[] = [
  {
    id: 'trabajo',
    topic: 'trabajo remoto',
    minutes: 7,
    title: 'Medellín o Cartagena: dónde trabajar según tu ritmo',
    excerpt: 'Clima, señal y precio por noche, ciudad por ciudad.',
    image: foto('trabajo-portatil'),
    alt: 'Portátil sobre una mesa junto a una planta.',
    position: '50% 50%',
  },
  {
    id: 'barrios',
    topic: 'barrios',
    minutes: 5,
    title: 'Tres días en Cartagena sin repetir calle',
    excerpt: 'Centro y Getsemaní, para caminar después del trabajo.',
    image: foto('cartagena-centro'),
    alt: 'Calle colonial con balcones de colores en Cartagena.',
    position: '50% 62%',
  },
  {
    id: 'escapadas',
    topic: 'escapadas',
    minutes: 4,
    title: 'Un fin de semana en la montaña, con café incluido',
    excerpt: 'Cabañas y miradores a pocas horas de la ciudad.',
    image: foto('jardin-campo'),
    alt: 'Casa de campo entre árboles y potreros verdes.',
    position: '54% 50%',
  },
];

export const FAQ: FaqItem[] = [
  { id: 'fotos', question: '¿Cómo sé que el hospedaje es como en las fotos?', answer: 'Visitamos cada hospedaje y revisamos al anfitrión antes de publicarlo.' },
  { id: 'cancelacion', question: '¿Puedo cancelar?', answer: 'Sí, sin costo hasta 5 días antes de la llegada.' },
  { id: 'pago', question: '¿Cómo pago?', answer: 'En línea y de forma segura. El anfitrión recibe el dinero cuando llegas.' },
  { id: 'duracion', question: '¿Cuánto puedo quedarme?', answer: 'Desde 2 noches. Desde 28 noches hay tarifa mensual.' },
  { id: 'persona', question: '¿Cómo hablo con una persona?', answer: 'Por WhatsApp, antes y durante tu estadía.' },
];

export const TRUST_FIGURES = [
  { id: 'casas', value: '120+', label: 'hospedajes en 3 destinos' },
  { id: 'nota', value: '4,8', label: 'calificación promedio' },
  { id: 'wifi', value: '100 Mbps', label: 'Wi-Fi medido en cada hospedaje' },
];

export const HERO_ASSURANCES = ['Hospedajes verificados', 'Pago seguro', 'Cancelación flexible'];

export const copFormat = new Intl.NumberFormat('es-CO');
export const formatCop = (value: number): string => `$${copFormat.format(value)}`;
