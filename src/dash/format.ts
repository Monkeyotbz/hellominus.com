import type { Tone } from './ui';

/** Formatos y etiquetas compartidos por /cuenta y /panel. */

const BOOKING: Record<string, { label: string; tone: Tone }> = {
  draft: { label: 'Borrador', tone: 'neutral' },
  pending_payment: { label: 'Pendiente de pago', tone: 'warn' },
  confirmed: { label: 'Confirmada', tone: 'success' },
  in_progress: { label: 'En curso', tone: 'success' },
  completed: { label: 'Completada', tone: 'neutral' },
  cancelled: { label: 'Cancelada', tone: 'alert' },
  no_show: { label: 'No se presentó', tone: 'alert' },
};

export function bookingStatus(status: string): { label: string; tone: Tone } {
  return BOOKING[status] ?? { label: status, tone: 'neutral' };
}

const CONTENT: Record<string, { label: string; tone: Tone }> = {
  published: { label: 'Publicado', tone: 'success' },
  draft: { label: 'Borrador', tone: 'neutral' },
  archived: { label: 'Archivado', tone: 'warn' },
};

export function contentStatus(status: string): { label: string; tone: Tone } {
  return CONTENT[status] ?? { label: status, tone: 'neutral' };
}

const TENANT: Record<string, { label: string; tone: Tone }> = {
  pending: { label: 'En revisión', tone: 'warn' },
  active: { label: 'Activo', tone: 'success' },
  suspended: { label: 'Suspendido', tone: 'alert' },
};

export function tenantStatus(status: string): { label: string; tone: Tone } {
  return TENANT[status] ?? { label: status, tone: 'neutral' };
}

const ITEM_TYPE: Record<string, string> = {
  accommodation: 'Hospedaje',
  tour: 'Tour',
  event: 'Evento',
  product: 'Producto',
  package: 'Paquete',
};

export function itemTypeLabel(type: string | null | undefined): string {
  return (type && ITEM_TYPE[type]) || 'Reserva';
}

export function formatDate(iso: string, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' }): string {
  return new Date(`${iso.slice(0, 10)}T00:00:00`).toLocaleDateString('es-CO', opts);
}

/** "9 – 14 oct 2026" o "28 sept – 2 oct 2026". */
export function formatRange(start: string | null, end: string | null): string {
  if (!start) return '';
  if (!end || end === start) return formatDate(start);
  const s = new Date(`${start}T00:00:00`);
  const e = new Date(`${end}T00:00:00`);
  const sameMonth = s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear();
  return sameMonth
    ? `${s.getDate()} – ${formatDate(end)}`
    : `${formatDate(start, { day: 'numeric', month: 'short' })} – ${formatDate(end)}`;
}

export function nightsBetween(start: string | null, end: string | null): number {
  if (!start || !end) return 0;
  return Math.max(0, Math.round((new Date(`${end}T00:00:00`).getTime() - new Date(`${start}T00:00:00`).getTime()) / 86_400_000));
}

/** Días desde hoy hasta la fecha (negativo si ya pasó). */
export function daysUntil(iso: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((new Date(`${iso.slice(0, 10)}T00:00:00`).getTime() - today.getTime()) / 86_400_000);
}

export function formatMoney(amount: number | null | undefined, currency = 'COP'): string {
  if (amount == null) return '—';
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
}

/** Montos grandes en corto para indicadores ("$3,7 M"); los menores, completos. */
export function formatMoneyCompact(amount: number, currency = 'COP'): string {
  if (Math.abs(amount) < 1_000_000) return formatMoney(amount, currency);
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency, currencyDisplay: 'narrowSymbol', notation: 'compact', maximumFractionDigits: 1 }).format(amount);
}

/** "1 persona", "3 personas". */
export function people(n: number | null | undefined): string {
  return n ? `${n} ${n === 1 ? 'persona' : 'personas'}` : '';
}

export function firstName(fullName: string | null | undefined): string {
  return (fullName ?? '').trim().split(/\s+/)[0] ?? '';
}

/** Saludo según la hora local. */
export function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'buenos días';
  if (h < 19) return 'buenas tardes';
  return 'buenas noches';
}
