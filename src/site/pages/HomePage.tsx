import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLocale } from '../../lib/locale';
import {
  getFeaturedTours,
  getFeaturedAccommodations,
  getFeaturedDestinations,
  getFeaturedTestimonials,
  type TourWithMedia,
  type StayWithMedia,
  type DestinationWithMedia,
} from '../../lib/queries';
import type { Row } from '../../lib/supabase';
import { heroSlidesSorted } from '../../data/heroSlides';
import { useLeadDialog } from '../LeadDialog';
import { Container, Eyebrow } from '../ui';
import { Rail, ExperienceCard, StayCard, DestinationTile } from '../cards';
import SearchBar from '../SearchBar';
import NewsletterBand from '../NewsletterBand';

const CATEGORIES = [
  { es: 'Islas y playas', en: 'Islands & beaches' },
  { es: 'Café de origen', en: 'Origin coffee' },
  { es: 'Ciudad y cultura', en: 'City & culture' },
  { es: 'Aventura y naturaleza', en: 'Adventure & nature' },
  { es: 'Gastronomía', en: 'Food' },
  { es: 'Pueblos patrimonio', en: 'Heritage towns' },
];

export default function HomePage() {
  const { locale, t } = useLocale();
  const { open } = useLeadDialog();
  const es = locale === 'es';
  const [tours, setTours] = useState<TourWithMedia[]>([]);
  const [stays, setStays] = useState<StayWithMedia[]>([]);
  const [dests, setDests] = useState<DestinationWithMedia[]>([]);
  const [testis, setTestis] = useState<Row<'testimonials'>[]>([]);

  useEffect(() => {
    getFeaturedTours(8).then(setTours);
    getFeaturedAccommodations(4).then(setStays);
    getFeaturedDestinations(6).then(setDests);
    getFeaturedTestimonials(3).then(setTestis);
  }, []);

  const slide = heroSlidesSorted()[0];

  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[560px] overflow-hidden bg-brand-deep py-16 sm:min-h-[620px]">
        {slide && (
          <video
            className="absolute inset-0 h-full w-full object-cover"
            style={{ transform: 'scale(1.28)', transformOrigin: 'left top' }}
            autoPlay
            muted
            loop
            playsInline
            poster={`/slides/${slide.file}.jpg`}
            onLoadedMetadata={(e) => {
              e.currentTarget.playbackRate = 0.55;
            }}
          >
            <source src={`/slides/${slide.file}.webm`} type="video/webm" />
            <source src={`/slides/${slide.file}.mp4`} type="video/mp4" />
          </video>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/25 to-black/70" />
        <Container className="relative flex flex-col justify-center">
          <div className="max-w-3xl">
            <Eyebrow dark>{es ? 'Hospedajes y tours en un solo lugar' : 'Stays and tours in one place'}</Eyebrow>
            <h1 className="mt-3 font-serif text-4xl leading-[1.05] text-[#FCFAF4] sm:text-5xl lg:text-6xl">
              {es ? 'Las mejores opciones para tu viaje, sin pagar de más' : 'The best options for your trip, without overpaying'}
            </h1>
            <p className="mt-4 max-w-lg text-lg text-[#E9E4D8]">
              {es
                ? 'Explorá cientos de ofertas en hospedajes, tours y experiencias.'
                : 'Explore hundreds of deals on stays, tours and experiences.'}
            </p>
            <SearchBar className="mt-7" />
            <button
              type="button"
              onClick={() => open()}
              className="mt-3 text-sm font-semibold text-white/90 underline decoration-white/40 underline-offset-4 hover:text-white"
            >
              {es ? '¿Preferís que te armemos el plan? Escribinos' : 'Rather we plan it for you? Message us'}
            </button>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-1 text-sm font-medium text-[#E4DFD2]">
              <span>{es ? '17 años operando en Colombia' : '17 years operating in Colombia'}</span>
              <span className="opacity-50">·</span>
              <span>{es ? 'Reserva directa, sin comisiones' : 'Book direct, no fees'}</span>
            </div>
          </div>
        </Container>
      </section>

      {/* Categorías */}
      <Container className="flex flex-wrap gap-3 pt-8">
        <span className="rounded-full border border-brand px-4 py-2 text-sm font-semibold text-brand">
          {es ? 'Todo' : 'All'}
        </span>
        {CATEGORIES.map((c) => (
          <Link
            key={c.es}
            to="/tours"
            className="rounded-full border border-line bg-white px-4 py-2 text-sm font-medium text-[#3A362E] hover:border-brand"
          >
            {es ? c.es : c.en}
          </Link>
        ))}
      </Container>

      {/* Experiencias */}
      <Rail
        eyebrow={es ? 'Originales Hellominus' : 'Hellominus Originals'}
        title={es ? 'Experiencias que solo conseguís acá' : 'Experiences you only get here'}
        subtitle={
          es
            ? 'Diseñadas y guiadas por gente de la región. Cupos reducidos.'
            : 'Designed and led by locals. Small groups.'
        }
        href="/tours"
        linkLabel={es ? 'Ver todos los tours' : 'All tours'}
      >
        {tours.length ? (
          tours.slice(0, 4).map((tr) => <ExperienceCard key={tr.id} tour={tr} />)
        ) : (
          <EmptyHint text={es ? 'Pronto vas a ver experiencias acá.' : 'Experiences coming soon.'} />
        )}
      </Rail>

      {/* Hospedajes */}
      <Rail
        eyebrow={es ? 'Hospedajes' : 'Stays'}
        title={es ? 'Dónde quedarte' : 'Where to stay'}
        href="/hospedajes"
        linkLabel={es ? 'Ver todos' : 'View all'}
        tint
      >
        {stays.length ? (
          stays.map((s) => <StayCard key={s.id} stay={s} />)
        ) : (
          <EmptyHint text={es ? 'Pronto vas a ver hospedajes acá.' : 'Stays coming soon.'} />
        )}
      </Rail>

      {/* Destinos */}
      {dests.length > 0 && (
        <Container className="py-12">
          <h2 className="mb-6 font-serif text-3xl text-ink sm:text-4xl">
            {es ? 'Explorá Colombia' : 'Explore Colombia'}
          </h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {dests.map((d) => (
              <DestinationTile key={d.id} dest={d} />
            ))}
          </div>
        </Container>
      )}


      {/* Testimonios */}
      {testis.length > 0 && (
        <Container className="py-4">
          <h2 className="mb-6 font-serif text-3xl text-ink sm:text-4xl">
            {es ? 'Lo que cuentan los viajeros' : 'What travelers say'}
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {testis.map((tt) => (
              <div key={tt.id} className="rounded-card border border-line bg-white p-6">
                <p className="text-[15px] leading-relaxed text-[#2C2820]">“{t(tt.quote)}”</p>
                <div className="mt-3 text-[13px] text-muted">
                  {[tt.author_name, tt.author_location].filter(Boolean).join(' · ')}
                </div>
              </div>
            ))}
          </div>
        </Container>
      )}

      <NewsletterBand />
    </div>
  );
}

function EmptyHint({ text }: { text: string }) {
  return (
    <div className="col-span-full rounded-card border border-dashed border-line py-12 text-center text-sm text-muted">
      {text}
    </div>
  );
}
