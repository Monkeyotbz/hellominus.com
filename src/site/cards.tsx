import { Link } from 'react-router-dom';
import { ArrowRight, Heart } from 'lucide-react';
import { useLocale } from '../lib/locale';
import type { TourWithMedia, StayWithMedia, DestinationWithMedia } from '../lib/queries';
import ImageThumb from './ImageThumb';
import { Money, Badge } from './ui';

export function Rail({
  eyebrow,
  title,
  subtitle,
  href,
  linkLabel,
  children,
  tint,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  href?: string;
  linkLabel?: string;
  children: React.ReactNode;
  tint?: boolean;
}) {
  return (
    <section className={tint ? 'bg-[#F1EEE4] py-14' : 'py-12'}>
      <div className="mx-auto w-full max-w-site px-4 sm:px-6 lg:px-10">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            {eyebrow && (
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">{eyebrow}</p>
            )}
            <h2 className="mt-2 font-serif text-3xl leading-tight text-ink sm:text-4xl">{title}</h2>
            {subtitle && <p className="mt-2 max-w-xl text-[15px] text-muted">{subtitle}</p>}
          </div>
          {href && (
            <Link
              to={href}
              className="flex shrink-0 items-center gap-1.5 text-[15px] font-semibold text-brand hover:text-brand-hover"
            >
              {linkLabel ?? 'Ver todo'} <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">{children}</div>
      </div>
    </section>
  );
}

export function ExperienceCard({ tour }: { tour: TourWithMedia }) {
  const { t } = useLocale();
  return (
    <Link to={`/tours/${tour.slug}`} className="group flex flex-col">
      <div className="relative">
        <ImageThumb
          images={tour.images}
          label={t(tour.name)}
          className="aspect-square"
        />
        {tour.featured && (
          <span className="absolute left-3 top-3">
            <Badge>DESTACADO</Badge>
          </span>
        )}
        <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90">
          <Heart className="h-4 w-4 text-ink" />
        </span>
      </div>
      <div className="mt-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-ink group-hover:text-brand">{t(tour.name)}</h3>
        </div>
        <p className="mt-0.5 text-[13px] text-muted">
          {[tour.city, t(tour.duration_label)].filter(Boolean).join(' · ')}
        </p>
        <div className="mt-2 flex items-center gap-3 text-sm">
          <Money value={tour.price_from} suffix="/ persona" />
        </div>
      </div>
    </Link>
  );
}

export function StayCard({ stay }: { stay: StayWithMedia }) {
  const { t } = useLocale();
  const typeLabel: Record<string, string> = {
    hotel: 'hotel',
    apartment: 'apartamento',
    house: 'casa',
    cabin: 'cabaña',
    hostel: 'hostal',
    glamping: 'glamping',
    finca: 'finca',
  };
  return (
    <Link to={`/hospedajes/${stay.slug}`} className="group flex flex-col">
      <div className="relative">
        <ImageThumb images={stay.images} label={t(stay.name)} className="aspect-square" />
        {stay.featured && (
          <span className="absolute left-3 top-3">
            <Badge>DESTACADO</Badge>
          </span>
        )}
      </div>
      <div className="mt-3">
        <h3 className="font-semibold text-ink group-hover:text-brand">{t(stay.name)}</h3>
        <p className="mt-0.5 text-[13px] text-muted">
          {[stay.city, typeLabel[stay.type] ?? stay.type, stay.max_guests ? `${stay.max_guests} huéspedes` : null]
            .filter(Boolean)
            .join(' · ')}
        </p>
        <div className="mt-2 text-sm">
          <Money value={stay.price_from} suffix="/ noche" />
        </div>
      </div>
    </Link>
  );
}

export function DestinationTile({ dest }: { dest: DestinationWithMedia }) {
  const { t } = useLocale();
  return (
    <Link to={`/destinos/${dest.slug}`} className="group relative block h-56 overflow-hidden rounded-card">
      <ImageThumb images={dest.images} className="h-full" rounded="rounded-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      <div className="absolute bottom-0 left-0 p-5 text-white">
        <div className="font-serif text-2xl">{t(dest.name)}</div>
        {t(dest.tagline) && <div className="text-[13px] opacity-90">{t(dest.tagline)}</div>}
      </div>
    </Link>
  );
}
