import { supabase, catalogImageUrl } from '../../lib/supabase';
import { pickText } from '../../lib/i18n';
import { CITIES, type City, type Property } from '../data';

/** Fila de `accommodations` con los campos de nómadas (wifi_mbps, min_nights, work_ready). */
interface StayRow {
  slug: string;
  city: string | null;
  price_from: number | null;
  wifi_mbps: number | null;
  min_nights: number | null;
  work_ready: boolean | null;
  name: unknown;
  location_note: unknown;
  images: { storage_path: string; is_cover: boolean; sort_order: number; alt: unknown }[] | null;
  accommodation_features: { features: { slug: string } | null }[] | null;
}

const STAY_COLUMNS = `slug, city, price_from, wifi_mbps, min_nights, work_ready, name, location_note,
  images:accommodation_images(storage_path, is_cover, sort_order, alt),
  accommodation_features(features(slug))`;

const TAGS: [string, string][] = [
  ['pool', 'Piscina'],
  ['terrace', 'Terraza'],
];

function isCity(value: string | null): value is City {
  return value !== null && (CITIES as string[]).includes(value);
}

function toProperty(row: StayRow): Property | null {
  if (!isCity(row.city)) return null;
  const images = [...(row.images ?? [])].sort((a, b) => Number(b.is_cover) - Number(a.is_cover) || a.sort_order - b.sort_order);
  const cover = images[0];
  const features = (row.accommodation_features ?? []).map((f) => f.features?.slug).filter((s): s is string => Boolean(s));
  const tag = TAGS.find(([slug]) => features.includes(slug))?.[1] ?? 'Hospedaje verificado';
  const title = pickText(row.name as never, 'es');
  if (!title || !cover) return null;

  return {
    // Las casas de muestra llevan el prefijo "demo-"; se quita para identificarlas igual que en data.ts.
    id: row.slug.replace(/^demo-/, ''),
    slug: row.slug,
    city: row.city,
    area: pickText(row.location_note as never, 'es') || row.city,
    title,
    image: catalogImageUrl(cover.storage_path),
    alt: pickText(cover.alt as never, 'es') || title,
    tag,
    wifiMbps: row.wifi_mbps ?? 0,
    minNights: row.min_nights ?? 1,
    pricePerNight: Number(row.price_from ?? 0),
    forWork: Boolean(row.work_ready),
  };
}

/**
 * Casas publicadas para la portada. Devuelve [] si falla o no hay datos:
 * quien llama decide qué mostrar (la portada usa los ejemplos de data.ts).
 */
export async function fetchHomeStays(): Promise<Property[]> {
  const { data, error } = await supabase
    .from('accommodations')
    .select(STAY_COLUMNS)
    .eq('status', 'published')
    .order('featured', { ascending: false })
    .order('sort_order', { ascending: true });
  if (error) {
    console.warn('No se pudieron leer las casas, se usan los ejemplos:', error.message);
    return [];
  }
  return ((data ?? []) as unknown as StayRow[]).map(toProperty).filter((p): p is Property => p !== null);
}
