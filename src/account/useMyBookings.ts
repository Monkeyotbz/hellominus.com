import { useEffect, useState } from 'react';
import { supabase, catalogImageUrl } from '../lib/supabase';
import type { Row } from '../lib/supabase';
import { daysUntil } from '../dash/format';

export type MyBooking = Pick<
  Row<'bookings'>,
  | 'id'
  | 'reference'
  | 'type'
  | 'item_type'
  | 'item_id'
  | 'item_title_snapshot'
  | 'start_date'
  | 'end_date'
  | 'guests'
  | 'status'
  | 'payment_status'
  | 'total_amount'
  | 'paid_amount'
  | 'currency'
  | 'created_at'
> & {
  /** Foto de portada del hospedaje/tour/producto (si sigue publicado). */
  cover: string | null;
  /** Ruta de su ficha pública, si existe. */
  href: string | null;
};

export type TripGroup = 'upcoming' | 'past' | 'cancelled';

const COLUMNS =
  'id, reference, type, item_type, item_id, item_title_snapshot, start_date, end_date, guests, status, payment_status, total_amount, paid_amount, currency, created_at';

const SOURCES: Record<string, { table: 'accommodations' | 'tours' | 'products'; images: string; base: string }> = {
  accommodation: { table: 'accommodations', images: 'accommodation_images', base: '/hospedajes/' },
  tour: { table: 'tours', images: 'tour_images', base: '/tours/' },
  product: { table: 'products', images: 'product_images', base: '' },
};

/** Próximo, pasado o cancelado, según estado y fechas. */
export function tripGroup(b: Pick<MyBooking, 'status' | 'start_date' | 'end_date'>): TripGroup {
  if (b.status === 'cancelled' || b.status === 'no_show') return 'cancelled';
  if (b.status === 'completed') return 'past';
  const last = b.end_date ?? b.start_date;
  if (last && daysUntil(last) < 0) return 'past';
  return 'upcoming';
}

/**
 * Reservas y compras del viajero (las registra Zuhay), con la foto y el enlace
 * del ítem. RLS: solo devuelve las suyas.
 */
export function useMyBookings(userId: string | undefined) {
  const [bookings, setBookings] = useState<MyBooking[] | null>(null);

  useEffect(() => {
    if (!userId) return;
    let active = true;
    (async () => {
      const { data } = await supabase.from('bookings').select(COLUMNS).eq('user_id', userId).order('start_date', { ascending: true, nullsFirst: false });
      const rows = data ?? [];

      // Portada y slug de cada ítem, agrupados por tipo (una consulta por tabla).
      const extra = new Map<string, { cover: string | null; href: string | null }>();
      await Promise.all(
        Object.entries(SOURCES).map(async ([type, src]) => {
          const ids = rows.filter((r) => r.item_type === type && r.item_id).map((r) => r.item_id as string);
          if (ids.length === 0) return;
          const { data: items } = await supabase
            .from(src.table)
            .select(`id, slug, images:${src.images}(storage_path, is_cover, sort_order)`)
            .in('id', ids);
          for (const item of (items ?? []) as unknown as { id: string; slug: string; images: { storage_path: string; is_cover: boolean; sort_order: number }[] }[]) {
            const img = [...(item.images ?? [])].sort((a, b) => Number(b.is_cover) - Number(a.is_cover) || a.sort_order - b.sort_order)[0];
            extra.set(item.id, { cover: img ? catalogImageUrl(img.storage_path) : null, href: src.base ? `${src.base}${item.slug}` : null });
          }
        }),
      );

      if (active) setBookings(rows.map((r) => ({ ...r, ...(extra.get(r.item_id ?? '') ?? { cover: null, href: null }) })));
    })();
    return () => {
      active = false;
    };
  }, [userId]);

  return bookings;
}
