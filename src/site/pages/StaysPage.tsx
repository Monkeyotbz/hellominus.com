import { useEffect, useMemo, useState } from 'react';
import { useLocale } from '../../lib/locale';
import { getAccommodations, type StayWithMedia } from '../../lib/queries';
import { Container } from '../ui';
import { StayCard } from '../cards';
import { useLeadDialog } from '../LeadDialog';
import TripSummary, { useTripQuery } from '../TripSummary';

const deburr = (s: string) =>
  s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();

export default function StaysPage() {
  const { locale } = useLocale();
  const es = locale === 'es';
  const { open } = useLeadDialog();
  const { destino, guests, leadMessage } = useTripQuery();
  const [rows, setRows] = useState<StayWithMedia[] | null>(null);
  const [city, setCity] = useState('');

  useEffect(() => {
    getAccommodations().then(setRows);
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
        <p className="text-[13px] text-muted">{es ? 'Inicio / Hospedajes' : 'Home / Stays'}</p>
        <h1 className="mt-2 font-serif text-4xl text-ink sm:text-5xl">
          {es ? 'Dónde quedarte en Colombia' : 'Where to stay in Colombia'}
        </h1>
        <p className="mt-1 text-[15px] text-muted">
          {es
            ? 'Cabañas, hoteles boutique y apartamentos seleccionados por ubicación y servicio.'
            : 'Cabins, boutique hotels and apartments picked for location and service.'}
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
              {es ? 'Todavía no hay hospedajes publicados.' : 'No stays published yet.'}
            </p>
            <button
              onClick={() => open({ type: 'accommodation', message: leadMessage, guests })}
              className="mt-3 font-semibold text-brand"
            >
              {es ? 'Contanos qué buscás' : 'Tell us what you need'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((s) => (
              <StayCard key={s.id} stay={s} />
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
