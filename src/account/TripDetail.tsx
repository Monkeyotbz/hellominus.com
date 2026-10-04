import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ImageOff } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Row } from '../lib/supabase';
import { useLocale } from '../lib/locale';
import { useSettings } from '../site/SettingsContext';
import { buttonClasses } from '../site/ui';
import { Card, EmptyState, StatusChip } from '../dash/ui';
import { bookingStatus, formatDate, formatMoney, formatRange, itemTypeLabel, nightsBetween } from '../dash/format';
import { useAccount } from './AccountLayout';

type Event = Pick<Row<'booking_events'>, 'id' | 'type' | 'title' | 'body' | 'created_at'>;

const PAYMENT: Record<string, string> = { unpaid: 'Sin pagar', partial: 'Pago parcial', paid: 'Pagado', refunded: 'Reembolsado' };

/** Detalle de una reserva: datos, pago y lo que ha pasado con ella. */
export default function TripDetail() {
  const { id = '' } = useParams();
  const { bookings } = useAccount();
  const { t } = useLocale();
  const { contactEmail } = useSettings();
  const [events, setEvents] = useState<Event[] | null>(null);
  const booking = bookings?.find((b) => b.id === id);

  useEffect(() => {
    // RLS: el viajero solo ve los eventos marcados como visibles para él.
    supabase
      .from('booking_events')
      .select('id, type, title, body, created_at')
      .eq('booking_id', id)
      .eq('visible_to_client', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => setEvents(data ?? []));
  }, [id]);

  if (bookings === null) return <div className="h-60 animate-pulse rounded-card bg-stone" />;
  if (!booking)
    return (
      <EmptyState
        title="No encontramos esta reserva"
        text="Puede que pertenezca a otra cuenta."
        action={
          <Link to="/cuenta/viajes" className={buttonClasses('outline', 'md')}>
            Volver a mis viajes
          </Link>
        }
      />
    );

  const status = bookingStatus(booking.status);
  const nights = nightsBetween(booking.start_date, booking.end_date);
  const facts: [string, string][] = [
    ['Tipo', itemTypeLabel(booking.item_type)],
    ['Fechas', formatRange(booking.start_date, booking.end_date) || '—'],
    ...(nights ? ([['Noches', String(nights)]] as [string, string][]) : []),
    ['Personas', booking.guests ? String(booking.guests) : '—'],
    ['Referencia', booking.reference],
    ['Reservado el', formatDate(booking.created_at)],
  ];

  return (
    <div className="space-y-6">
      <Link to="/cuenta/viajes" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Mis viajes
      </Link>
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="font-serif text-[2rem] font-light leading-tight text-ink">{booking.item_title_snapshot || itemTypeLabel(booking.item_type)}</h2>
        <StatusChip tone={status.tone}>{status.label}</StatusChip>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <div className="overflow-hidden rounded-card border border-line bg-white">
            {booking.cover ? (
              <img src={booking.cover} alt="" className="aspect-[16/7] w-full object-cover" />
            ) : (
              <div className="flex aspect-[16/7] items-center justify-center bg-stone text-muted">
                <ImageOff className="h-7 w-7" aria-hidden="true" />
              </div>
            )}
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4 p-6 sm:grid-cols-3">
              {facts.map(([k, v]) => (
                <div key={k}>
                  <dt className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">{k}</dt>
                  <dd className={`mt-1 text-ink ${k === 'Referencia' ? 'font-mono text-sm' : ''}`}>{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <Card title="Lo que ha pasado">
            {events === null ? (
              <p className="text-sm text-muted">Cargando…</p>
            ) : events.length === 0 ? (
              <p className="text-sm text-muted">Aquí verás las novedades de tu reserva: confirmación, pagos e indicaciones de llegada.</p>
            ) : (
              <ol className="relative space-y-6 border-l border-line pl-6">
                {events.map((e) => (
                  <li key={e.id} className="relative">
                    <span className="absolute -left-[29px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-brand" aria-hidden="true" />
                    <p className="text-xs text-muted">{new Date(e.created_at).toLocaleString('es-CO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                    <p className="font-medium text-ink">{t(e.title) || 'Actualización'}</p>
                    {t(e.body) && <p className="mt-0.5 whitespace-pre-line text-sm text-muted">{t(e.body)}</p>}
                  </li>
                ))}
              </ol>
            )}
          </Card>
        </div>

        <aside className="space-y-6">
          <Card title="Pago">
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Total</dt>
                <dd className="font-medium text-ink">{formatMoney(booking.total_amount, booking.currency)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Pagado</dt>
                <dd className="text-ink">{formatMoney(booking.paid_amount, booking.currency)}</dd>
              </div>
              <div className="flex justify-between gap-4 border-t border-line pt-3">
                <dt className="text-muted">Estado</dt>
                <dd className="text-ink">{PAYMENT[booking.payment_status] ?? booking.payment_status}</dd>
              </div>
            </dl>
          </Card>
          {booking.href && (
            <Link to={booking.href} className={`${buttonClasses('outline', 'md')} w-full`}>
              Ver {itemTypeLabel(booking.item_type).toLowerCase()}
            </Link>
          )}
          <p className="text-sm text-muted">
            ¿Algo no está bien con esta reserva? Escríbenos a{' '}
            <a href={`mailto:${contactEmail}?subject=${encodeURIComponent(`Reserva ${booking.reference}`)}`} className="text-brand hover:underline">
              {contactEmail}
            </a>{' '}
            con la referencia <span className="font-mono text-ink">{booking.reference}</span>.
          </p>
        </aside>
      </div>
    </div>
  );
}
