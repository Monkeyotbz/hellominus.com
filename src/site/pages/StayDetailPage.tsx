import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Check, ExternalLink, MapPin, MessageCircle } from 'lucide-react';
import { useLocale } from '../../lib/locale';
import { getAccommodationBySlug, type StayWithMedia } from '../../lib/queries';
import { crmImageUrl } from '../../lib/crm';
import { Container, Money, Button, buttonClasses } from '../ui';
import { useLeadDialog } from '../LeadDialog';
import { useSettings } from '../SettingsContext';

export default function StayDetailPage() {
  const { slug = '' } = useParams();
  const { locale, t } = useLocale();
  const es = locale === 'es';
  const { open } = useLeadDialog();
  const { whatsappHref } = useSettings();
  const [stay, setStay] = useState<StayWithMedia | null | undefined>(undefined);

  useEffect(() => {
    setStay(undefined);
    getAccommodationBySlug(slug).then(setStay);
  }, [slug]);

  if (stay === undefined) return <Container className="py-20 text-sm text-muted">{es ? 'Cargando…' : 'Loading…'}</Container>;
  if (stay === null)
    return (
      <Container className="py-20">
        <p className="text-muted">{es ? 'No encontramos este hospedaje.' : 'Stay not found.'}</p>
        <Link to="/hospedajes" className="mt-2 inline-block font-semibold text-brand">
          ← {es ? 'Ver todos' : 'View all'}
        </Link>
      </Container>
    );

  const gallery = stay.images ?? [];
  const amenities = stay.features ?? [];

  return (
    <Container className="pt-6">
      <Link to="/hospedajes" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> {es ? 'Hospedajes' : 'Stays'}
      </Link>

      <h1 className="mt-3 font-serif text-3xl text-ink sm:text-4xl">{t(stay.name)}</h1>
      <div className="mt-1 inline-flex items-center gap-1 text-sm text-[#3A362E]">
        <MapPin className="h-3.5 w-3.5 text-muted" /> {[stay.city, stay.region].filter(Boolean).join(', ')}
      </div>

      <div className="mt-4 grid gap-2 overflow-hidden rounded-[20px] sm:h-[420px] sm:grid-cols-3 sm:grid-rows-2">
        {gallery.length ? (
          gallery.slice(0, 5).map((im, i) => (
            <div
              key={im.storage_path}
              className={`aspect-[4/3] bg-[#E6DFD0] sm:aspect-auto ${
                i === 0 ? 'sm:col-span-2 sm:row-span-2' : 'hidden sm:block'
              }`}
            >
              <img src={crmImageUrl(im.storage_path)} alt="" className="h-full w-full object-cover" />
            </div>
          ))
        ) : (
          <div className="flex aspect-[4/3] items-center justify-center bg-[#E6DFD0] text-sm text-muted sm:aspect-auto sm:col-span-3 sm:row-span-2">
            {es ? 'Fotos próximamente' : 'Photos coming soon'}
          </div>
        )}
      </div>

      <div className="mt-8 grid gap-12 pb-16 lg:grid-cols-[1fr_360px]">
        <div>
          <div className="flex flex-wrap gap-x-6 gap-y-1 border-b border-line pb-6 text-sm text-[#3A362E]">
            {stay.max_guests && <span>{stay.max_guests} {es ? 'huéspedes' : 'guests'}</span>}
            {stay.bedrooms != null && <span>{stay.bedrooms} {es ? 'habitaciones' : 'bedrooms'}</span>}
            {stay.beds != null && <span>{stay.beds} {es ? 'camas' : 'beds'}</span>}
            {stay.bathrooms != null && <span>{stay.bathrooms} {es ? 'baños' : 'baths'}</span>}
          </div>

          {t(stay.description) && (
            <section className="border-b border-line py-7">
              <h2 className="mb-3 font-serif text-2xl">{es ? 'Sobre el lugar' : 'About the place'}</h2>
              <p className="whitespace-pre-line text-[15px] leading-relaxed text-[#3A362E]">{t(stay.description)}</p>
            </section>
          )}

          {amenities.length > 0 && (
            <section className="py-7">
              <h2 className="mb-4 font-serif text-2xl">{es ? 'Servicios' : 'Amenities'}</h2>
              <ul className="grid gap-2.5 sm:grid-cols-2">
                {amenities.map((f) => (
                  <li key={f.slug} className="flex gap-2.5 text-sm">
                    <Check className="h-[18px] w-[18px] shrink-0 text-brand" /> {t(f.label) || f.slug}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <div>
          <div className="sticky top-24 rounded-[18px] border border-[#E4DCCB] bg-white p-6 shadow-[0_18px_40px_-24px_rgba(20,24,17,.25)]">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">
                <Money value={stay.price_from} />
              </span>
              <span className="text-sm text-muted">/ {es ? 'noche' : 'night'}</span>
            </div>
            <Button
              size="lg"
              className="mt-4 w-full !rounded-xl"
              onClick={() =>
                open({ type: 'accommodation', related_type: 'accommodation', related_id: stay.id, itemTitle: t(stay.name) })
              }
            >
              {es ? 'Solicitar reserva' : 'Request booking'}
            </Button>
            <a
              href={whatsappHref(`Hola, quiero info del hospedaje "${t(stay.name)}"`)}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClasses('outline', 'lg', 'mt-2.5 w-full !rounded-xl')}
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
            {stay.external_booking_url && (
              <a
                href={stay.external_booking_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex items-center justify-center gap-1.5 text-sm font-semibold text-brand hover:text-brand-hover"
              >
                <ExternalLink className="h-4 w-4" />
                {es ? 'Ver en' : 'View on'} {stay.external_platform ?? 'la plataforma'}
              </a>
            )}
          </div>
        </div>
      </div>
    </Container>
  );
}
