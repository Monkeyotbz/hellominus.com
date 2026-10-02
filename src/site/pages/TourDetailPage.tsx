import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Check, Clock, MapPin, MessageCircle, Users, X } from 'lucide-react';
import { useLocale } from '../../lib/locale';
import { getTourBySlug, type TourWithMedia } from '../../lib/queries';
import { catalogImageUrl } from '../../lib/supabase';
import { Container, Money, Stars, Button, buttonClasses } from '../ui';
import { useLeadDialog } from '../LeadDialog';
import { useSettings } from '../SettingsContext';

export default function TourDetailPage() {
  const { slug = '' } = useParams();
  const { locale, t, tList } = useLocale();
  const es = locale === 'es';
  const { open } = useLeadDialog();
  const { whatsappHref } = useSettings();
  const [tour, setTour] = useState<TourWithMedia | null | undefined>(undefined);

  useEffect(() => {
    setTour(undefined);
    getTourBySlug(slug).then(setTour);
  }, [slug]);

  if (tour === undefined) return <Container className="py-20 text-sm text-muted">{es ? 'Cargando…' : 'Loading…'}</Container>;
  if (tour === null)
    return (
      <Container className="py-20">
        <p className="text-muted">{es ? 'No encontramos este tour.' : 'Tour not found.'}</p>
        <Link to="/tours" className="mt-2 inline-block font-semibold text-brand">
          ← {es ? 'Ver todos los tours' : 'All tours'}
        </Link>
      </Container>
    );

  const includes = (tour.features ?? []).filter((f) => f.kind === 'tour_inclusion' || f.kind === 'general');
  const excluded = tList(tour.excluded);
  const gallery = tour.images ?? [];

  return (
    <Container className="pt-6">
      <Link to="/tours" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> {es ? 'Tours' : 'Tours'}
      </Link>

      <h1 className="mt-3 font-serif text-3xl text-ink sm:text-4xl">{t(tour.name)}</h1>
      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#3A362E]">
        <Stars rating={4.9} count={0} />
        <span className="text-muted">·</span>
        <span className="inline-flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5 text-muted" /> {[tour.city, tour.region].filter(Boolean).join(', ')}
        </span>
      </div>

      {/* Galería */}
      <div className="mt-4 grid gap-2 overflow-hidden rounded-[20px] sm:h-[420px] sm:grid-cols-3 sm:grid-rows-2">
        {gallery.length ? (
          gallery.slice(0, 5).map((im, i) => (
            <div
              key={im.storage_path}
              className={`aspect-[4/3] bg-[#E6DFD0] sm:aspect-auto ${
                i === 0 ? 'sm:col-span-2 sm:row-span-2' : 'hidden sm:block'
              }`}
            >
              <img src={catalogImageUrl(im.storage_path)} alt="" className="h-full w-full object-cover" />
            </div>
          ))
        ) : (
          <div className="flex aspect-[4/3] items-center justify-center bg-[#E6DFD0] text-sm text-muted sm:aspect-auto sm:col-span-3 sm:row-span-2">
            {es ? 'Fotos próximamente' : 'Photos coming soon'}
          </div>
        )}
      </div>

      {/* Cuerpo */}
      <div className="mt-8 grid gap-12 pb-16 lg:grid-cols-[1fr_360px]">
        <div>
          <div className="grid grid-cols-2 gap-5 border-b border-line pb-7">
            <Fact icon={<Clock className="h-5 w-5 text-brand" />} label={t(tour.duration_label) || (tour.duration_hours ? `${tour.duration_hours} h` : '—')} sub={t(tour.schedule_label)} />
            <Fact icon={<Users className="h-5 w-5 text-brand" />} label={es ? 'Grupo pequeño' : 'Small group'} sub={tour.max_pax ? `Máx. ${tour.max_pax}` : ''} />
            <Fact icon={<MapPin className="h-5 w-5 text-brand" />} label={es ? 'Punto de encuentro' : 'Meeting point'} sub={tour.meeting_point ?? ''} />
          </div>

          {t(tour.description) && (
            <section className="border-b border-line py-7">
              <h2 className="mb-3 font-serif text-2xl">{es ? 'Qué vas a hacer' : "What you'll do"}</h2>
              <p className="whitespace-pre-line text-[15px] leading-relaxed text-[#3A362E]">{t(tour.description)}</p>
            </section>
          )}

          {(includes.length > 0 || excluded.length > 0) && (
            <section className="border-b border-line py-7">
              <h2 className="mb-4 font-serif text-2xl">{es ? 'Qué incluye' : "What's included"}</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <ul className="space-y-2.5">
                  {includes.map((f) => (
                    <li key={f.slug} className="flex gap-2.5 text-sm">
                      <Check className="h-[18px] w-[18px] shrink-0 text-brand" /> {t(f.label) || f.slug}
                    </li>
                  ))}
                </ul>
                <ul className="space-y-2.5">
                  {excluded.map((x) => (
                    <li key={x} className="flex gap-2.5 text-sm text-muted">
                      <X className="h-[18px] w-[18px] shrink-0 text-accent" /> {x}
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}

          <section className="py-7">
            <h2 className="mb-3 font-serif text-2xl">{es ? 'Antes de reservar' : 'Before you book'}</h2>
            <div className="space-y-2 text-sm leading-relaxed text-[#3A362E]">
              <p>
                <b>{es ? 'Cancelación:' : 'Cancellation:'}</b>{' '}
                {es ? 'gratis hasta 48 h antes.' : 'free up to 48 h before.'}
              </p>
              <p>
                <b>{es ? 'Reserva:' : 'Booking:'}</b>{' '}
                {es
                  ? 'no se cobra nada online. Un asesor confirma cupo y forma de pago.'
                  : 'nothing is charged online. An advisor confirms availability and payment.'}
              </p>
            </div>
          </section>
        </div>

        {/* Sticky card */}
        <div>
          <div className="sticky top-24 rounded-[18px] border border-[#E4DCCB] bg-white p-6 shadow-[0_18px_40px_-24px_rgba(20,24,17,.25)]">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">
                <Money value={tour.price_from} />
              </span>
              <span className="text-sm text-muted">/ {es ? 'persona' : 'person'}</span>
            </div>
            <Button
              size="lg"
              className="mt-4 w-full !rounded-xl"
              onClick={() => open({ type: 'tour', related_type: 'tour', related_id: tour.id, itemTitle: t(tour.name) })}
            >
              {es ? 'Solicitar reserva' : 'Request booking'}
            </Button>
            <a
              href={whatsappHref(`Hola, quiero info del tour "${t(tour.name)}"`)}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClasses('outline', 'lg', 'mt-2.5 w-full !rounded-xl')}
            >
              <MessageCircle className="h-4 w-4" /> {es ? 'Preguntar por WhatsApp' : 'Ask on WhatsApp'}
            </a>
            <p className="mt-3 text-center text-[12px] text-muted">
              {es ? 'No se cobra nada ahora.' : 'Nothing charged now.'}
            </p>
          </div>
        </div>
      </div>
    </Container>
  );
}

function Fact({ icon, label, sub }: { icon: React.ReactNode; label: string; sub?: string }) {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div>
        <div className="text-[15px] font-semibold">{label}</div>
        {sub && <div className="text-[13px] text-muted">{sub}</div>}
      </div>
    </div>
  );
}
