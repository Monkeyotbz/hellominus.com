import { useSearchParams } from 'react-router-dom';
import { X } from 'lucide-react';
import { useLocale } from '../lib/locale';
import { Container } from './ui';

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

function fmt(iso: string) {
  const [, m, d] = iso.split('-');
  if (!m || !d) return iso;
  return `${Number(d)} ${MESES[Number(m) - 1] ?? ''}`.trim();
}

/** Lee los parámetros de búsqueda que deja SearchBar en la URL. */
export function useTripQuery() {
  const [params] = useSearchParams();
  const destino = params.get('destino') ?? '';
  const desde = params.get('desde') ?? '';
  const hasta = params.get('hasta') ?? '';
  const guests = Number(params.get('adultos') ?? 0) + Number(params.get('ninos') ?? 0) || undefined;

  const parts: string[] = [];
  if (destino) parts.push(destino);
  if (desde) parts.push(hasta ? `${desde} a ${hasta}` : desde);
  if (guests) parts.push(`${guests} viajero${guests === 1 ? '' : 's'}`);
  const leadMessage = parts.length ? `Búsqueda: ${parts.join(' · ')}.` : '';

  return { destino, desde, hasta, guests, leadMessage };
}

/** Cinta con el resumen de la búsqueda activa + botón para limpiarla. */
export default function TripSummary() {
  const { locale } = useLocale();
  const es = locale === 'es';
  const [, setParams] = useSearchParams();
  const { destino, desde, hasta, guests } = useTripQuery();

  if (!destino && !desde && !guests) return null;

  return (
    <Container className="mt-4">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl bg-brand-tint px-4 py-2.5 text-sm text-brand-deep">
        <span className="font-semibold">{es ? 'Tu búsqueda:' : 'Your search:'}</span>
        {destino && <span>{destino}</span>}
        {desde && (
          <span>
            · {fmt(desde)}
            {hasta && ` – ${fmt(hasta)}`}
          </span>
        )}
        {guests && (
          <span>
            · {guests} {es ? (guests === 1 ? 'viajero' : 'viajeros') : guests === 1 ? 'traveler' : 'travelers'}
          </span>
        )}
        <button
          type="button"
          onClick={() => setParams({}, { replace: true })}
          className="ml-auto inline-flex items-center gap-1 font-semibold hover:underline"
        >
          <X className="h-3.5 w-3.5" /> {es ? 'Limpiar' : 'Clear'}
        </button>
      </div>
    </Container>
  );
}
