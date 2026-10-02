/**
 * Datos de EJEMPLO de la portada. Nada de esto es real: precios, cifras,
 * reseñas, políticas y artículos se reemplazan cuando existan los datos
 * verdaderos. Las fotos son las del proyecto (public/home).
 */

export type City = 'Cartagena' | 'Medellín' | 'Jardín';
export type StayFilter = 'todas' | City | 'trabajo';

export interface Property {
  id: string;
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
    city: 'Cartagena',
    area: 'El Laguito',
    title: 'Apartamento con terraza sobre la laguna',
    image: '/home/p-laguito.jpg',
    alt: 'Terraza con hamaca y vista a la laguna del Laguito.',
    tag: 'Vista a la laguna',
    wifiMbps: 150,
    minNights: 3,
    pricePerNight: 320000,
    forWork: true,
  },
  {
    id: 'torres',
    city: 'Cartagena',
    area: 'Torres del Lago',
    title: 'Balcón frente al agua',
    image: '/home/p-torres.jpg',
    alt: 'Balcón con piscina y vista a la bahía.',
    tag: 'Piscina del edificio',
    wifiMbps: 120,
    minNights: 2,
    pricePerNight: 290000,
    forWork: true,
  },
  {
    id: 'bocagrande',
    city: 'Cartagena',
    area: 'Bocagrande',
    title: 'Apartamento con piscina en la terraza',
    image: '/home/p-palmetto.jpg',
    alt: 'Piscina con cascada y vista al mar.',
    tag: 'Piscina',
    wifiMbps: 100,
    minNights: 2,
    pricePerNight: 270000,
    forWork: false,
  },
  {
    id: 'conquistador',
    city: 'Cartagena',
    area: 'Nuevo Conquistador',
    title: 'Terraza con vista al mar',
    image: '/home/p-conquistador.jpg',
    alt: 'Terraza amplia con vista al mar y al horizonte.',
    tag: 'Frente al mar',
    wifiMbps: 100,
    minNights: 3,
    pricePerNight: 350000,
    forWork: false,
  },
  {
    id: 'poblado',
    city: 'Medellín',
    area: 'El Poblado',
    title: 'Penthouse con piscina cubierta',
    image: '/home/p-medellin.jpg',
    alt: 'Penthouse amplio con piscina cubierta y zonas de trabajo.',
    tag: 'Piscina cubierta',
    wifiMbps: 300,
    minNights: 5,
    pricePerNight: 480000,
    forWork: true,
  },
  {
    id: 'jardin',
    city: 'Jardín',
    area: 'Antioquia',
    title: 'Casa de campo con vista a las montañas',
    image: '/home/p-jardin.jpg',
    alt: 'Casa de campo entre café y montañas.',
    tag: 'Montaña',
    wifiMbps: 50,
    minNights: 2,
    pricePerNight: 240000,
    forWork: false,
  },
];

export const FEATURED_PROPERTY_ID = 'poblado';

export const PLANS: Plan[] = [
  { id: 'cholon', title: 'Isla Cholón', detail: 'Día de playa', price: 180000, image: '/home/t-cholon.jpg', alt: 'Isla Cholón, aguas turquesa y botes.' },
  { id: 'rosario', title: 'Islas del Rosario', detail: 'Cuatro islas', price: 240000, image: '/home/t-rosario.jpg', alt: 'Isla de las Islas del Rosario con arrecife turquesa.' },
  { id: 'bora', title: 'Bora Bora Beach Club', detail: 'Club de playa', price: 220000, image: '/home/t-bora.jpg', alt: 'Club de playa con sombrillas de colores.' },
  { id: 'tranquila', title: 'Playa Tranquila', detail: 'Descanso', price: 160000, image: '/home/t-tranquila.jpg', alt: 'Playa Tranquila con arena blanca.' },
];

export const PRODUCTS: Product[] = [
  { id: 'tote', kind: 'tela', title: 'Tote bag de lino', detail: 'Hecha en Medellín', price: 95000 },
  { id: 'cafe', kind: 'café', title: 'Café de origen, 340 g', detail: 'Antioquia', price: 42000 },
  { id: 'taza', kind: 'cerámica', title: 'Taza hecha a mano', detail: 'Ráquira', price: 58000 },
  { id: 'gorra', kind: 'tejido', title: 'Gorra de iraca', detail: 'Sandoná', price: 78000 },
];

export const REVIEWS: Review[] = [
  { id: 'r1', quote: 'Trabajé cinco semanas desde la terraza. La conexión nunca se cayó en una reunión.', author: 'Lucas, desarrollador de software' },
  { id: 'r2', quote: 'Reservé la casa y el plan a las islas en un solo paso.', author: 'Marta, de visita desde Bogotá' },
  { id: 'r3', quote: 'Llegué por una semana y me quedé un mes.', author: 'Ana, diseñadora' },
];

export const POSTS: Post[] = [
  {
    id: 'trabajo',
    topic: 'trabajo remoto',
    minutes: 7,
    title: 'Medellín o Cartagena: dónde trabajar según tu ritmo',
    excerpt: 'Clima, señal y precio por noche, ciudad por ciudad.',
    image: '/home/nota-trabajo.jpg',
    alt: 'Vista nocturna de Medellín con un edificio y montañas al fondo.',
    position: '50% 50%',
  },
  {
    id: 'barrios',
    topic: 'barrios',
    minutes: 5,
    title: 'Tres días en Cartagena sin repetir calle',
    excerpt: 'Centro y Getsemaní, para caminar después del trabajo.',
    image: '/home/nota-barrios.jpg',
    alt: 'Fachada colonial blanca con balcones cubiertos de buganvilias en Cartagena.',
    position: '50% 62%',
  },
  {
    id: 'escapadas',
    topic: 'escapadas',
    minutes: 4,
    title: 'Un fin de semana en la montaña, con café incluido',
    excerpt: 'Cabañas y miradores a pocas horas de la ciudad.',
    image: '/home/nota-escapada.jpg',
    alt: 'Cabaña de madera con techo rojo entre jardines y montañas.',
    position: '54% 50%',
  },
];

export const FAQ: FaqItem[] = [
  { id: 'fotos', question: '¿Cómo sé que la casa es como en las fotos?', answer: 'Visitamos cada casa y revisamos al anfitrión antes de publicarla.' },
  { id: 'cancelacion', question: '¿Puedo cancelar?', answer: 'Sí, sin costo hasta 5 días antes de la llegada.' },
  { id: 'pago', question: '¿Cómo pago?', answer: 'En línea y de forma segura. El anfitrión recibe el dinero cuando llegas.' },
  { id: 'duracion', question: '¿Cuánto puedo quedarme?', answer: 'Desde 2 noches. Desde 28 noches hay tarifa mensual.' },
  { id: 'persona', question: '¿Cómo hablo con una persona?', answer: 'Por WhatsApp, antes y durante tu estadía.' },
];

export const TRUST_FIGURES = [
  { id: 'casas', value: '120+', label: 'casas en 3 destinos' },
  { id: 'nota', value: '4,8', label: 'calificación promedio' },
  { id: 'wifi', value: '100 Mbps', label: 'Wi-Fi medido en cada casa' },
];

export const HERO_ASSURANCES = ['Casas verificadas', 'Pago seguro', 'Cancelación flexible'];

export const copFormat = new Intl.NumberFormat('es-CO');
export const formatCop = (value: number): string => `$${copFormat.format(value)}`;
