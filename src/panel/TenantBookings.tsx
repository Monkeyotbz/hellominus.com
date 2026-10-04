import { useEffect, useMemo, useState } from 'react';
import { CalendarCheck, Mail, MessageCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Row } from '../lib/supabase';
import { buildWhatsappLink } from '../lib/contact';
import { EmptyState, PageHeader, Segmented, StatusChip } from '../dash/ui';
import { bookingStatus, daysUntil, formatDate, formatMoney, formatRange, itemTypeLabel, nightsBetween, people } from '../dash/format';

type Booking = Pick<
  Row<'bookings'>,
  | 'id'
  | 'reference'
  | 'item_type'
  | 'item_title_snapshot'
  | 'contact_name'
  | 'contact_email'
  | 'contact_whatsapp'
  | 'start_date'
  | 'end_date'
  | 'guests'
  | 'status'
  | 'payment_status'
  | 'total_amount'
  | 'paid_amount'
  | 'currency'
  | 'created_at'
>;
type Group = 'upcoming' | 'past' | 'cancelled' | 'all';

function groupOf(b: Booking): Exclude<Group, 'all'> {
  if (b.status === 'cancelled' || b.status === 'no_show') return 'cancelled';
  if (b.status === 'completed') return 'past';
  const last = b.end_date ?? b.start_date;
  return last && daysUntil(last) < 0 ? 'past' : 'upcoming';
}

/**
 * Reservas y pedidos del espacio. Las registra Zuhay (que atiende y cierra
 * cada venta); aquí el anfitrión las consulta y contacta al viajero.
 */
export default function TenantBookings({ tenantId }: { tenantId: string }) {
  const [rows, setRows] = useState<Booking[] | null>(null);
  const [group, setGroup] = useState<Group>('upcoming');

  useEffect(() => {
    supabase
      .from('bookings')
      .select(
        'id, reference, item_type, item_title_snapshot, contact_name, contact_email, contact_whatsapp, start_date, end_date, guests, status, payment_status, total_amount, paid_amount, currency, created_at',
      )
      .eq('tenant_id', tenantId)
      .order('start_date', { ascending: true, nullsFirst: false })
      .then(({ data }) => setRows(data ?? []));
  }, [tenantId]);

  const counts = useMemo(() => {
    const c: Record<Group, number> = { upcoming: 0, past: 0, cancelled: 0, all: 0 };
    for (const b of rows ?? []) {
      c[groupOf(b)]++;
      c.all++;
    }
    return c;
  }, [rows]);

  const list = (rows ?? []).filter((b) => group === 'all' || groupOf(b) === group);
  if (group === 'past') list.reverse();

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader title="Reservas y pedidos" meta={<span>Llegan desde Zuhay, que atiende y cierra cada venta.</span>} />

      {rows === null ? (
        <div className="h-48 animate-pulse rounded-card bg-stone" />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={<CalendarCheck className="h-5 w-5" />}
          title="Todavía no tienes reservas"
          text="Cuando un viajero reserve uno de tus hospedajes, tours o productos, verás aquí sus datos y fechas."
        />
      ) : (
        <>
          <Segmented
            label="Filtrar reservas"
            value={group}
            onChange={setGroup}
            options={[
              { value: 'upcoming', label: 'Próximas', count: counts.upcoming },
              { value: 'past', label: 'Pasadas', count: counts.past },
              { value: 'cancelled', label: 'Canceladas', count: counts.cancelled },
              { value: 'all', label: 'Todas', count: counts.all },
            ]}
          />
          {list.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted">No hay reservas en este grupo.</p>
          ) : (
            <ul className="space-y-3">
              {list.map((b) => {
                const st = bookingStatus(b.status);
                const nights = nightsBetween(b.start_date, b.end_date);
                const d = b.start_date ? daysUntil(b.start_date) : null;
                const wa = b.contact_whatsapp ? buildWhatsappLink(b.contact_whatsapp, `Hola ${b.contact_name ?? ''}, te escribo por tu reserva ${b.reference}.`) : '';
                return (
                  <li key={b.id} className="rounded-card border border-line bg-white p-4 sm:p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">
                          {itemTypeLabel(b.item_type)} · <span className="font-mono normal-case tracking-normal">{b.reference}</span>
                        </p>
                        <p className="mt-0.5 font-serif text-[1.25rem] text-ink">{b.contact_name || 'Viajero'}</p>
                        <p className="text-sm text-muted">
                          {b.item_title_snapshot}
                          {b.start_date && ` · ${formatRange(b.start_date, b.end_date)}`}
                          {nights ? ` · ${nights} ${nights === 1 ? 'noche' : 'noches'}` : ''}
                          {b.guests ? ` · ${people(b.guests)}` : ''}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {groupOf(b) === 'upcoming' && d !== null && d <= 7 && <StatusChip tone="ink">{d <= 0 ? 'Hoy' : d === 1 ? 'Mañana' : `En ${d} días`}</StatusChip>}
                        <StatusChip tone={st.tone}>{st.label}</StatusChip>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3 text-sm">
                      <div className="flex flex-wrap gap-4">
                        {wa && (
                          <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-brand hover:underline">
                            <MessageCircle className="h-4 w-4" /> WhatsApp
                          </a>
                        )}
                        {b.contact_email && (
                          <a href={`mailto:${b.contact_email}?subject=${encodeURIComponent(`Reserva ${b.reference}`)}`} className="inline-flex items-center gap-1.5 text-brand hover:underline">
                            <Mail className="h-4 w-4" /> Correo
                          </a>
                        )}
                        {!wa && !b.contact_email && <span className="text-muted">Sin datos de contacto</span>}
                      </div>
                      <span className="text-muted">
                        <span className="font-medium text-ink">{formatMoney(b.total_amount, b.currency)}</span>
                        {b.paid_amount ? ` · pagado ${formatMoney(b.paid_amount, b.currency)}` : ''} · recibida {formatDate(b.created_at)}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
