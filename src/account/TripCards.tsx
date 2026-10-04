import { Link } from 'react-router-dom';
import { CalendarDays, ImageOff } from 'lucide-react';
import { buttonClasses } from '../site/ui';
import { Hand, StatusChip } from '../dash/ui';
import { bookingStatus, daysUntil, formatMoney, formatRange, itemTypeLabel, nightsBetween } from '../dash/format';
import type { MyBooking } from './useMyBookings';

function Cover({ booking, className }: { booking: MyBooking; className: string }) {
  return booking.cover ? (
    <img src={booking.cover} alt="" className={`object-cover ${className}`} />
  ) : (
    <div className={`flex items-center justify-center bg-stone text-muted ${className}`}>
      <ImageOff className="h-6 w-6" aria-hidden="true" />
    </div>
  );
}

function countdown(start: string | null): string | null {
  if (!start) return null;
  const d = daysUntil(start);
  if (d < 0) return 'En curso';
  if (d === 0) return 'Es hoy';
  if (d === 1) return 'Mañana';
  return `Faltan ${d} días`;
}

function stayLine(b: MyBooking): string {
  const nights = nightsBetween(b.start_date, b.end_date);
  return [
    formatRange(b.start_date, b.end_date),
    nights ? `${nights} ${nights === 1 ? 'noche' : 'noches'}` : null,
    b.guests ? `${b.guests} ${b.guests === 1 ? 'persona' : 'personas'}` : null,
  ]
    .filter(Boolean)
    .join(' · ');
}

/** La reserva más cercana, en grande. */
export function NextTripCard({ booking }: { booking: MyBooking }) {
  const status = bookingStatus(booking.status);
  const left = countdown(booking.start_date);
  return (
    <article className="overflow-hidden rounded-card border border-line bg-white sm:grid sm:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <Cover booking={booking} className="aspect-[4/3] w-full sm:aspect-auto sm:h-full" />
      <div className="flex flex-col p-6 sm:p-8">
        <Hand>tu próximo viaje</Hand>
        <h2 className="mt-2 font-serif text-[1.9rem] font-light leading-tight text-ink">{booking.item_title_snapshot || itemTypeLabel(booking.item_type)}</h2>
        <p className="mt-2 flex items-center gap-2 text-sm text-muted">
          <CalendarDays className="h-4 w-4 shrink-0" aria-hidden="true" /> {stayLine(booking) || itemTypeLabel(booking.item_type)}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {left && <StatusChip tone="ink">{left}</StatusChip>}
          <StatusChip tone={status.tone}>{status.label}</StatusChip>
        </div>
        <p className="mt-4 text-xs text-muted">
          Referencia <span className="font-mono text-ink">{booking.reference}</span>
        </p>
        <div className="mt-auto flex flex-wrap gap-2 pt-6">
          <Link to={`/cuenta/viajes/${booking.id}`} className={buttonClasses('primary', 'md', 'flex-1 sm:flex-none')}>
            Ver detalle
          </Link>
          {booking.href && (
            <Link to={booking.href} className={buttonClasses('outline', 'md', 'flex-1 sm:flex-none')}>
              Ver {itemTypeLabel(booking.item_type).toLowerCase()}
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

/** Reserva en la lista de Mis viajes. */
export function TripRow({ booking }: { booking: MyBooking }) {
  const status = bookingStatus(booking.status);
  return (
    <Link
      to={`/cuenta/viajes/${booking.id}`}
      className="group flex gap-4 rounded-card border border-line bg-white p-3 transition hover:border-ink/30 hover:shadow-card sm:p-4"
    >
      <Cover booking={booking} className="h-20 w-24 shrink-0 rounded-lg sm:h-24 sm:w-32" />
      <div className="flex min-w-0 flex-1 flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">{itemTypeLabel(booking.item_type)}</p>
          <p className="truncate font-serif text-[1.25rem] text-ink group-hover:text-brand">{booking.item_title_snapshot || booking.reference}</p>
          <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted">
            <CalendarDays className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {stayLine(booking) || booking.reference}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 sm:flex-col sm:flex-nowrap sm:items-end sm:gap-1.5">
          <StatusChip tone={status.tone}>{status.label}</StatusChip>
          <span className="text-sm font-medium text-ink">{formatMoney(booking.total_amount, booking.currency)}</span>
        </div>
      </div>
    </Link>
  );
}
