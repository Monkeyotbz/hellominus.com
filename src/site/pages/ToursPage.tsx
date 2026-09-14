import { useEffect, useMemo, useState } from 'react';
import { useLocale } from '../../lib/locale';
import { getTours, type TourWithMedia } from '../../lib/queries';
import { Container } from '../ui';
import { ExperienceCard } from '../cards';
import { useLeadDialog } from '../LeadDialog';
import TripSummary, { useTripQuery } from '../TripSummary';

const deburr = (s: string) =>
  s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();

export default function ToursPage() {
  const { locale } = useLocale();
  const es = locale === 'es';
  const { open } = useLeadDialog();
  const { destino, guests, leadMessage } = useTripQuery();
  const [rows, setRows] = useState<TourWithMedia[] | null>(null);
  const [city, setCity] = useState<string>('');

  useEffect(() => {
    getTours().then(setRows);
  }, []);

  useEffect(() => {
    if (!destino || !rows) return;
    const match = (rows.map((r) => r.city).filter(Boolean) as string[]).find(
      (c) => deburr(c).includes(deburr(destino)) || deburr(destino).includes(deburr(c))
    );
    if (match) setCity(match);
  }, [destino, rows]);

  const cities = useMemo(
    () => Array.from(new Set((rows ?? []).map((r) => r.city).filter(Boolean))) as string[],
    [rows]
  );
  const filtered = (rows ?? []).filter((r) => !city || r.city === city);

  return (
    <div>
      <Container className="pt-8">
        <p className="text-[13px] text-muted">{es ? 'Inicio / Tours' : 'Home / Tours'}</p>
        <h1 className="mt-2 font-serif text-4xl text-ink sm:text-5xl">
          {es ? 'Tours y experiencias en Colombia' : 'Tours & experiences in Colombia'}
        </h1>
        <p className="mt-1 text-[15px] text-muted">
          {es
            ? 'Guiadas por gente de cada región. Reservás directo, sin comisiones.'
            : 'Led by locals in every region. Book direct, no fees.'}
        </p>
      </Container>

      <TripSummary />

      <Container className="mt-6 flex flex-wrap gap-2 border-b border-line pb-5">
        <button
          type="button"
          onClick={() => setCity('')}
          className={`rounded-full border px-4 py-2 text-sm font-medium ${
            city === '' ? 'border-brand text-brand' : 'border-line bg-white text-[#3A362E]'
          }`}
        >
          {es ? 'Todas las ciudades' : 'All cities'}
        </button>
        {cities.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCity(c)}
            className={`rounded-full border px-4 py-2 text-sm font-medium ${
              city === c ? 'border-brand text-brand' : 'border-line bg-white text-[#3A362E]'
            }`}
          >
            {c}
          </button>
        ))}
      </Container>

      <Container className="py-8">
        {rows === null ? (
          <p className="text-sm text-muted">{es ? 'Cargando…' : 'Loading…'}</p>
        ) : filtered.length === 0 ? (
          <div className="rounded-card border border-dashed border-line py-16 text-center">
            <p className="text-muted">
              {es ? 'Todavía no hay tours publicados.' : 'No tours published yet.'}
            </p>
            <button
              onClick={() => open({ type: 'tour', message: leadMessage, guests })}
              className="mt-3 font-semibold text-brand"
            >
              {es ? 'Escribinos y te armamos el plan' : 'Message us and we’ll plan it'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((tr) => (
              <ExperienceCard key={tr.id} tour={tr} />
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
