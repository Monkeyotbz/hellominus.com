import type { I18nText } from '../lib/i18n';

export interface HeroSlide {
  /** Orden en el carrusel. */
  order: number;
  /** Nombre base del archivo en /public/slides (sin extensión). */
  file: string;
  /** Título grande sobre el video. */
  title: I18nText;
  /** Subtítulo / bajada. */
  subtitle?: I18nText;
  /** Texto y destino del botón principal. */
  cta?: { label: I18nText; href: string };
}

/**
 * Slides del hero. Agrega una entrada por cada video cargado en /public/slides.
 * Los archivos esperados: `/slides/<file>.mp4` (+ opcional `.webm`, `.jpg` poster,
 * `-v.mp4` vertical). Ver public/slides/README.md.
 */
export const HERO_SLIDES: HeroSlide[] = [
  {
    order: 1,
    file: '01-hero', // public/slides/01-hero.mp4
    title: {
      es: 'Viví la Colombia que no sale en los folletos',
      en: 'Experience the Colombia guidebooks miss',
    },
    subtitle: {
      es: 'Tours, hospedajes y experiencias con anfitriones locales',
      en: 'Tours, stays and experiences with local hosts',
    },
    cta: { label: { es: 'Armar mi viaje', en: 'Plan my trip' }, href: '/tours' },
  },
];

export const heroSlidesSorted = () => [...HERO_SLIDES].sort((a, b) => a.order - b.order);
