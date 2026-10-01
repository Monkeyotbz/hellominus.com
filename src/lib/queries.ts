import { supabase } from './supabase';
import type { Row } from './supabase';
import type { Json } from '../types/supabase';

export type ImageRow = { storage_path: string; sort_order: number; is_cover: boolean; alt: Json };
export type FeatureRow = { slug: string; label: Json; kind: string; icon: string | null };

export type TourWithMedia = Row<'tours'> & { images: ImageRow[]; features?: FeatureRow[] };
export type StayWithMedia = Row<'accommodations'> & { images: ImageRow[]; features?: FeatureRow[] };
export type DestinationWithMedia = Row<'destinations'> & { images: ImageRow[] };

function sortImages<T extends { images?: ImageRow[] }>(row: T): T {
  if (row.images) {
    row.images = [...row.images].sort(
      (a, b) => Number(b.is_cover) - Number(a.is_cover) || a.sort_order - b.sort_order
    );
  }
  return row;
}

/* ------------------------------------------------------------------ settings */

export async function getSiteSettings(): Promise<Record<string, Record<string, unknown>>> {
  const { data } = await supabase.from('site_settings').select('key, value');
  const out: Record<string, Record<string, unknown>> = {};
  for (const r of data ?? []) out[r.key] = (r.value as Record<string, unknown>) ?? {};
  return out;
}

/* -------------------------------------------------------------------- tours */

const TOUR_SELECT = `*, images:tour_images(storage_path, sort_order, is_cover, alt)`;
const TOUR_DETAIL_SELECT = `${TOUR_SELECT}, tour_features(features(slug, label, kind, icon))`;

export async function getFeaturedTours(limit = 8): Promise<TourWithMedia[]> {
  const { data, error } = await supabase
    .from('tours')
    .select(TOUR_SELECT)
    .eq('status', 'published')
    .eq('featured', true)
    .order('sort_order', { ascending: true })
    .limit(limit);
  if (error) console.error('getFeaturedTours', error.message);
  return ((data as unknown as TourWithMedia[]) ?? []).map(sortImages);
}

export async function getTours(opts: { city?: string; limit?: number } = {}): Promise<TourWithMedia[]> {
  let q = supabase
    .from('tours')
    .select(TOUR_SELECT)
    .eq('status', 'published')
    .order('featured', { ascending: false })
    .order('sort_order', { ascending: true });
  if (opts.city) q = q.eq('city', opts.city);
  if (opts.limit) q = q.limit(opts.limit);
  const { data, error } = await q;
  if (error) console.error('getTours', error.message);
  return ((data as unknown as TourWithMedia[]) ?? []).map(sortImages);
}

export async function getTourBySlug(slug: string): Promise<TourWithMedia | null> {
  const { data, error } = await supabase
    .from('tours')
    .select(TOUR_DETAIL_SELECT)
    .eq('slug', slug)
    .maybeSingle();
  if (error) console.error('getTourBySlug', error.message);
  if (!data) return null;
  const row = data as unknown as TourWithMedia & {
    tour_features?: { features: FeatureRow }[];
  };
  row.features = (row.tour_features ?? []).map((f) => f.features).filter(Boolean);
  return sortImages(row);
}

/* --------------------------------------------------------------- hospedajes */

const STAY_SELECT = `*, images:accommodation_images(storage_path, sort_order, is_cover, alt)`;
const STAY_DETAIL_SELECT = `${STAY_SELECT}, accommodation_features(features(slug, label, kind, icon))`;

export async function getFeaturedAccommodations(limit = 8): Promise<StayWithMedia[]> {
  const { data, error } = await supabase
    .from('accommodations')
    .select(STAY_SELECT)
    .eq('status', 'published')
    .eq('featured', true)
    .order('sort_order', { ascending: true })
    .limit(limit);
  if (error) console.error('getFeaturedAccommodations', error.message);
  return ((data as unknown as StayWithMedia[]) ?? []).map(sortImages);
}

export async function getAccommodations(opts: { city?: string } = {}): Promise<StayWithMedia[]> {
  let q = supabase
    .from('accommodations')
    .select(STAY_SELECT)
    .eq('status', 'published')
    .order('featured', { ascending: false })
    .order('sort_order', { ascending: true });
  if (opts.city) q = q.eq('city', opts.city);
  const { data, error } = await q;
  if (error) console.error('getAccommodations', error.message);
  return ((data as unknown as StayWithMedia[]) ?? []).map(sortImages);
}

export async function getAccommodationBySlug(slug: string): Promise<StayWithMedia | null> {
  const { data, error } = await supabase
    .from('accommodations')
    .select(STAY_DETAIL_SELECT)
    .eq('slug', slug)
    .maybeSingle();
  if (error) console.error('getAccommodationBySlug', error.message);
  if (!data) return null;
  const row = data as unknown as StayWithMedia & {
    accommodation_features?: { features: FeatureRow }[];
  };
  row.features = (row.accommodation_features ?? []).map((f) => f.features).filter(Boolean);
  return sortImages(row);
}

/* -------------------------------------------------------------- destinations */

export async function getFeaturedDestinations(limit = 6): Promise<DestinationWithMedia[]> {
  const { data, error } = await supabase
    .from('destinations')
    .select(`*, images:destination_images(storage_path, sort_order, is_cover, alt)`)
    .eq('status', 'published')
    .order('featured', { ascending: false })
    .order('sort_order', { ascending: true })
    .limit(limit);
  if (error) console.error('getFeaturedDestinations', error.message);
  return ((data as unknown as DestinationWithMedia[]) ?? []).map(sortImages);
}

/* -------------------------------------------------------------- testimonials */

export async function getFeaturedTestimonials(limit = 6): Promise<Row<'testimonials'>[]> {
  const { data } = await supabase
    .from('testimonials')
    .select('*')
    .eq('status', 'published')
    .eq('featured', true)
    .order('sort_order', { ascending: true })
    .limit(limit);
  return (data as Row<'testimonials'>[]) ?? [];
}

/* --------------------------------------------------------------------- leads */

export interface LeadInput {
  type: 'tour' | 'accommodation' | 'event' | 'real_estate' | 'general';
  name: string;
  whatsapp?: string;
  email?: string;
  message?: string;
  locale?: string;
  related_type?: 'tour' | 'accommodation' | 'event' | 'real_estate';
  related_id?: string;
  check_in?: string;
  check_out?: string;
  guests?: number;
}

export async function submitLead(input: LeadInput): Promise<{ error: string | null }> {
  const params = new URLSearchParams(window.location.search);
  const { error } = await supabase.from('leads').insert({
    ...input,
    source: 'web',
    utm_source: params.get('utm_source'),
    utm_medium: params.get('utm_medium'),
    utm_campaign: params.get('utm_campaign'),
    referrer: document.referrer || null,
    landing_path: window.location.pathname,
  });
  return { error: error?.message ?? null };
}

export async function subscribeNewsletter(email: string, locale = 'es'): Promise<{ error: string | null }> {
  const { error } = await supabase.from('newsletter_subscribers').insert({
    email,
    locale,
    status: 'pending',
    source: 'web',
    landing_path: window.location.pathname,
    consent_at: new Date().toISOString(),
  });
  // Duplicado (email ya suscrito) no es un error para el usuario
  if (error && error.code === '23505') return { error: null };
  return { error: error?.message ?? null };
}
