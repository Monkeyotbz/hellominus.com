import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, LifeBuoy } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getFeaturedAccommodations, type StayWithMedia } from '../lib/queries';
import { useSettings } from '../site/SettingsContext';
import { StayCard } from '../site/cards';
import { foto } from '../home/data';
import { Card, Checklist, Hand, ProgressBar, StatusChip } from '../dash/ui';
import { tenantStatus } from '../dash/format';
import { NextTripCard, TripRow } from './TripCards';
import { tripGroup } from './useMyBookings';
import { useAccount } from './AccountLayout';

/** Resumen del viajero: su próximo viaje (o ideas para uno) y lo pendiente. */
export default function AccountHome() {
  const { bookings } = useAccount();
  const upcoming = (bookings ?? []).filter((b) => tripGroup(b) === 'upcoming');
  const [ideas, setIdeas] = useState<StayWithMedia[]>([]);

  useEffect(() => {
    getFeaturedAccommodations(3).then(setIdeas);
  }, []);

  return (
    <div className="space-y-12">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-10">
          {bookings === null ? (
            <div className="h-72 animate-pulse rounded-card bg-stone" aria-label="Cargando tus viajes" />
          ) : upcoming.length > 0 ? (
            <>
              <NextTripCard booking={upcoming[0]} />
              {upcoming.length > 1 && (
                <section>
                  <h2 className="mb-3 font-serif text-[1.35rem] text-ink">También tienes</h2>
                  <div className="space-y-3">
                    {upcoming.slice(1, 4).map((b) => (
                      <TripRow key={b.id} booking={b} />
                    ))}
                  </div>
                </section>
              )}
            </>
          ) : (
            <NoTripYet />
          )}
        </div>

        <aside className="space-y-6">
          <ProfileCompletion />
          <HostCard />
          <HelpCard />
        </aside>
      </div>

      {ideas.length > 0 && (
        <section>
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <Hand>ideas para tu próximo viaje</Hand>
              <h2 className="mt-1 font-serif text-[1.6rem] font-light text-ink">Hospedajes que te pueden gustar</h2>
            </div>
            <Link to="/hospedajes" className="hidden shrink-0 items-center gap-1 text-sm text-brand hover:underline sm:inline-flex">
              Ver todos <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {ideas.map((s) => (
              <StayCard key={s.id} stay={s} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

/** Estado vacío con foto: invita a planear en vez de mostrar una caja vacía. */
function NoTripYet() {
  return (
    <section className="relative overflow-hidden rounded-card">
      <img src={foto('playa-palma-turquesa')} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#141412]/75 via-[#141412]/45 to-transparent" />
      <div className="relative max-w-md px-6 py-12 text-white sm:px-10 sm:py-16">
        <p className="font-hand text-[1.4rem] font-semibold leading-none text-white">tu próxima escapada</p>
        <h2 className="mt-2 font-serif text-[2.2rem] font-light leading-tight">Aún no tienes viajes reservados</h2>
        <p className="mt-3 text-white/85">Hospedajes por noches o por meses, y planes con gente de cada región.</p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            to="/hospedajes"
            className="inline-flex min-h-touch items-center border border-white bg-white px-5 py-3 text-sm font-medium text-ink hover:bg-surface"
          >
            Ver hospedajes
          </Link>
          <Link
            to="/tours"
            className="inline-flex min-h-touch items-center border border-white px-5 py-3 text-sm font-medium text-white hover:bg-white/10"
          >
            Ver planes
          </Link>
        </div>
      </div>
    </section>
  );
}

function ProfileCompletion() {
  const { profile } = useAuth();
  const steps = [
    {
      label: 'Tu nombre',
      done: Boolean(profile?.full_name?.trim()),
      to: '/cuenta/perfil',
    },
    {
      label: 'Tu WhatsApp',
      done: Boolean(profile?.phone?.trim()),
      hint: 'Para coordinar tu llegada',
      to: '/cuenta/perfil',
    },
    {
      label: 'Tu foto',
      done: Boolean(profile?.avatar_path),
      hint: 'Ayuda a que el anfitrión te reconozca',
      to: '/cuenta/perfil',
    },
  ];
  const done = steps.filter((s) => s.done).length;
  if (done === steps.length) return null;
  return (
    <Card title="Completa tu perfil">
      <ProgressBar value={(done / steps.length) * 100} label={`${done} de ${steps.length} listos`} />
      <div className="mt-4">
        <Checklist steps={steps} />
      </div>
    </Card>
  );
}

function HostCard() {
  const { memberships } = useAuth();
  if (memberships.length > 0) {
    const t = memberships[0].tenant;
    const st = tenantStatus(t.status);
    return (
      <Card eyebrow="Tu espacio de anfitrión" title={t.name}>
        <StatusChip tone={st.tone}>{st.label}</StatusChip>
        <Link to="/panel" className="mt-4 flex items-center gap-1 text-sm font-medium text-brand hover:underline">
          Ir a mi panel <ArrowRight className="h-4 w-4" />
        </Link>
      </Card>
    );
  }
  return (
    <section className="rounded-card bg-brand p-6 text-brand-on">
      <p className="font-hand text-[1.35rem] font-semibold leading-none">¿tienes un lugar?</p>
      <h2 className="mt-2 font-serif text-[1.45rem] font-light leading-snug">Publica tus hospedajes, tours o productos</h2>
      <p className="mt-2 text-sm text-brand-on-muted">Abre tu espacio en Hellominus y recibe reservas.</p>
      <Link
        to="/anfitriones"
        className="mt-5 inline-flex min-h-touch items-center border border-brand-on px-4 py-2.5 text-sm font-medium hover:bg-white/10"
      >
        Crear mi espacio
      </Link>
    </section>
  );
}

function HelpCard() {
  const { contactEmail, hasWhatsapp, whatsappHref } = useSettings();
  return (
    <Card>
      <div className="flex gap-3">
        <LifeBuoy className="mt-0.5 h-5 w-5 shrink-0 text-brand" aria-hidden="true" />
        <div className="text-sm">
          <p className="font-medium text-ink">¿Necesitas ayuda?</p>
          <p className="mt-1 text-muted">
            Escríbenos a{' '}
            <a href={`mailto:${contactEmail}`} className="text-brand hover:underline">
              {contactEmail}
            </a>
            {hasWhatsapp && (
              <>
                {' '}
                o por{' '}
                <a href={whatsappHref()} target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">
                  WhatsApp
                </a>
              </>
            )}
            .
          </p>
        </div>
      </div>
    </Card>
  );
}
