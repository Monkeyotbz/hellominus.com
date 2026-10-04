import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BedDouble, Compass, ExternalLink, Newspaper, ShoppingBag } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { supabase, catalogImageUrl } from '../lib/supabase';
import type { Row } from '../lib/supabase';
import { pickText } from '../lib/i18n';
import { useAuth } from '../contexts/AuthContext';
import { Card, Checklist, EmptyState, PageHeader, ProgressBar, Stat, StatusChip, type ChecklistStep } from '../dash/ui';
import { bookingStatus, daysUntil, firstName, formatMoney, formatMoneyCompact, formatRange, greeting, people, tenantStatus } from '../dash/format';

type Tenant = Row<'tenants'>;
type Booking = Pick<Row<'bookings'>, 'id' | 'reference' | 'item_title_snapshot' | 'contact_name' | 'start_date' | 'end_date' | 'guests' | 'status' | 'total_amount' | 'currency' | 'created_at'>;

const KINDS: { kind: string; table: 'accommodations' | 'tours' | 'products'; entity: string; singular: string; icon: LucideIcon }[] = [
  { kind: 'hospedaje', table: 'accommodations', entity: 'accommodations', singular: 'hospedaje', icon: BedDouble },
  { kind: 'tours', table: 'tours', entity: 'tours', singular: 'tour', icon: Compass },
  { kind: 'mercado', table: 'products', entity: 'products', singular: 'producto', icon: ShoppingBag },
];

interface Data {
  tenant: Tenant;
  published: number;
  bookings: Booking[];
}

/** Inicio del panel: guía de primeros pasos o indicadores del mes. */
export default function PanelHome({ tenantId }: { tenantId: string }) {
  const { profile } = useAuth();
  const [data, setData] = useState<Data | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const [{ data: tenant }, { data: bookings }, ...counts] = await Promise.all([
        supabase.from('tenants').select('*').eq('id', tenantId).single(),
        supabase
          .from('bookings')
          .select('id, reference, item_title_snapshot, contact_name, start_date, end_date, guests, status, total_amount, currency, created_at')
          .eq('tenant_id', tenantId)
          .order('start_date', { ascending: true }),
        ...KINDS.map((k) =>
          supabase.from(k.table).select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId).eq('status', 'published'),
        ),
      ]);
      if (active && tenant)
        setData({ tenant, bookings: bookings ?? [], published: counts.reduce((n, c) => n + (c.count ?? 0), 0) });
    })();
    return () => {
      active = false;
    };
  }, [tenantId]);

  if (!data) return <div className="mx-auto h-96 max-w-6xl animate-pulse rounded-card bg-stone" />;

  const { tenant, bookings, published } = data;
  const kinds = KINDS.filter((k) => tenant.kinds.includes(k.kind));
  const st = tenantStatus(tenant.status);

  // --- Guía de primeros pasos
  const first = kinds[0];
  const steps: ChecklistStep[] = [
    { label: 'Sube tu logo y una foto de portada', done: Boolean(tenant.logo_path && tenant.cover_path), to: '/panel/espacio' },
    {
      label: 'Cuenta quiénes son y qué ofrecen',
      done: (pickText(tenant.description) ?? '').trim().length >= 40,
      hint: 'Dos o tres frases bastan.',
      to: '/panel/espacio',
    },
    { label: 'Deja cómo contactarte', done: Boolean(tenant.contact_whatsapp || tenant.contact_email), to: '/panel/espacio' },
    {
      label: first ? `Publica tu primer ${first.singular} con fotos` : 'Publica tu primera publicación',
      done: published > 0,
      to: first ? `/panel/${first.entity}/new` : undefined,
    },
    {
      label: 'Revisión del equipo de Hellominus',
      done: tenant.status === 'active',
      hint: 'Te escribimos cuando tu espacio esté aprobado.',
    },
  ];
  const doneCount = steps.filter((s) => s.done).length;
  const onboarding = doneCount < steps.length;

  // --- Indicadores
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const live = bookings.filter((b) => !['cancelled', 'no_show'].includes(b.status));
  const thisMonth = live.filter((b) => b.created_at >= monthStart);
  const arrivals = live.filter((b) => b.start_date && daysUntil(b.start_date) >= 0 && daysUntil(b.start_date) <= 7);
  const income = thisMonth
    .filter((b) => ['confirmed', 'in_progress', 'completed'].includes(b.status))
    .reduce((sum, b) => sum + Number(b.total_amount ?? 0), 0);
  const upcoming = live.filter((b) => b.start_date && daysUntil(b.start_date) >= 0).slice(0, 5);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <PageHeader
        hand={`${greeting()}${firstName(profile?.full_name) ? `, ${firstName(profile?.full_name)}` : ''}`}
        title={tenant.name}
        meta={
          <>
            <StatusChip tone={st.tone}>{st.label}</StatusChip>
            {tenant.status === 'active' && (
              <a href={`/anfitrion/${tenant.slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-brand hover:underline">
                Ver mi página <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </>
        }
      />

      {onboarding && (
        <section className="grid overflow-hidden rounded-card border border-line bg-white md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <div className="bg-brand p-6 text-brand-on sm:p-8">
            <p className="font-hand text-[1.4rem] font-semibold leading-none">primeros pasos</p>
            <h2 className="mt-2 font-serif text-[1.8rem] font-light leading-tight">Prepara tu espacio para recibir viajeros</h2>
            <p className="mt-3 text-sm text-brand-on-muted">
              {tenant.status === 'pending'
                ? 'Mientras revisamos tu espacio, deja todo listo: así sale completo el día que lo aprobemos.'
                : 'Completa estos pasos para que tu página se vea completa.'}
            </p>
            <div className="mt-6">
              <ProgressBar onDark value={(doneCount / steps.length) * 100} label={`${doneCount} de ${steps.length} pasos`} />
            </div>
          </div>
          <div className="p-4 sm:p-6">
            <Checklist steps={steps} />
          </div>
        </section>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat value={thisMonth.length} label="Reservas este mes" to="/panel/reservas" />
        <Stat value={arrivals.length} label="Llegadas en 7 días" to="/panel/reservas" />
        <Stat
          value={formatMoneyCompact(income)}
          label="Confirmado este mes"
          hint={income >= 1_000_000 ? `${formatMoney(income)} · según Zuhay` : 'Según lo registrado por Zuhay'}
        />
        <Stat value={published} label="Publicaciones activas" to={first ? `/panel/${first.entity}` : undefined} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <Card
          className="lg:self-start"
          title="Próximas reservas"
          action={
            <Link to="/panel/reservas" className="inline-flex items-center gap-1 text-sm text-brand hover:underline">
              Ver todas <ArrowRight className="h-4 w-4" />
            </Link>
          }
          bodyClassName={upcoming.length ? 'p-0' : 'p-5 sm:p-6'}
        >
          {upcoming.length === 0 ? (
            <EmptyState
              title="Todavía no hay reservas"
              text="Cuando un viajero reserve por Zuhay, aparecerá aquí con sus fechas y datos."
            />
          ) : (
            <ul className="divide-y divide-line">
              {upcoming.map((b) => {
                const bs = bookingStatus(b.status);
                const d = b.start_date ? daysUntil(b.start_date) : null;
                return (
                  <li key={b.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-6">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-ink">{b.contact_name || 'Viajero'}</p>
                      <p className="truncate text-sm text-muted">
                        {b.item_title_snapshot} · {formatRange(b.start_date, b.end_date)}
                        {b.guests ? ` · ${people(b.guests)}` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {d !== null && d <= 7 && <StatusChip tone="ink">{d === 0 ? 'Hoy' : d === 1 ? 'Mañana' : `En ${d} días`}</StatusChip>}
                      <StatusChip tone={bs.tone}>{bs.label}</StatusChip>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <aside className="space-y-6">
          <Card title="Crear">
            <div className="grid gap-2">
              {kinds.map(({ entity, singular, icon: Icon }) => (
                <Link key={entity} to={`/panel/${entity}/new`} className="flex items-center gap-3 rounded-lg border border-line px-4 py-3 text-sm text-ink transition hover:border-brand/50 hover:bg-brand-tint">
                  <Icon className="h-4 w-4 text-brand" /> Nuevo {singular}
                </Link>
              ))}
              <Link to="/panel/blog_posts/new" className="flex items-center gap-3 rounded-lg border border-line px-4 py-3 text-sm text-ink transition hover:border-brand/50 hover:bg-brand-tint">
                <Newspaper className="h-4 w-4 text-brand" /> Escribir en el blog
              </Link>
            </div>
          </Card>

          <Card title="Tu página" bodyClassName="p-0">
            <div className="relative h-28 bg-stone">
              {tenant.cover_path && <img src={catalogImageUrl(tenant.cover_path)} alt="" className="h-full w-full object-cover" />}
              <div className="absolute -bottom-6 left-5 h-14 w-14 overflow-hidden rounded-lg border-2 border-white bg-white">
                {tenant.logo_path && <img src={catalogImageUrl(tenant.logo_path)} alt="" className="h-full w-full object-cover" />}
              </div>
            </div>
            <div className="px-5 pb-5 pt-9">
              <p className="font-serif text-lg text-ink">{tenant.name}</p>
              <p className="text-sm text-muted">{pickText(tenant.tagline) || 'Agrega una frase corta en Mi espacio.'}</p>
              <Link to="/panel/espacio" className="mt-3 inline-block text-sm text-brand hover:underline">
                Editar mi espacio
              </Link>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
