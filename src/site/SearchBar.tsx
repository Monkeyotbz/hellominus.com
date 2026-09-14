import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Minus, Plus, Search, Users } from 'lucide-react';
import { useLocale } from '../lib/locale';

type Tipo = 'hospedajes' | 'tours';

const POPULAR = [
  'Cartagena',
  'Medellín',
  'Eje Cafetero',
  'Jardín',
  'Islas del Rosario',
  'Santa Marta',
  'San Andrés',
  'Guatapé',
  'Jericó',
  'Barichara',
  'Palomino',
  'Bogotá',
];

const todayISO = () => new Date().toISOString().slice(0, 10);

function Segment({
  icon: IconCmp,
  label,
  children,
  className = '',
}: {
  icon: typeof MapPin;
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative flex items-center gap-2.5 px-4 py-3 ${className}`}>
      <IconCmp className="h-5 w-5 shrink-0 text-brand" strokeWidth={1.75} />
      <span className="min-w-0 flex-1">
        <span className="block text-overline text-muted">{label}</span>
        {children}
      </span>
    </div>
  );
}

function Stepper({
  label,
  hint,
  value,
  set,
  min = 0,
}: {
  label: string;
  hint?: string;
  value: number;
  set: (n: number) => void;
  min?: number;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <span>
        <span className="block text-sm font-semibold text-ink">{label}</span>
        {hint && <span className="block text-caption text-muted">{hint}</span>}
      </span>
      <span className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => set(Math.max(min, value - 1))}
          disabled={value <= min}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-ink disabled:opacity-40"
          aria-label={`${label} −`}
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="w-5 text-center text-sm font-semibold tabular-nums">{value}</span>
        <button
          type="button"
          onClick={() => set(value + 1)}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-ink"
          aria-label={`${label} +`}
        >
          <Plus className="h-4 w-4" />
        </button>
      </span>
    </div>
  );
}

export default function SearchBar({ className = '' }: { className?: string }) {
  const navigate = useNavigate();
  const { locale } = useLocale();
  const es = locale === 'es';

  const [tipo, setTipo] = useState<Tipo>('hospedajes');
  const [destino, setDestino] = useState('');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [adultos, setAdultos] = useState(2);
  const [ninos, setNinos] = useState(0);
  const [paxOpen, setPaxOpen] = useState(false);
  const paxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!paxOpen) return;
    const onDown = (e: MouseEvent) => {
      if (paxRef.current && !paxRef.current.contains(e.target as Node)) setPaxOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [paxOpen]);

  const viajeros = adultos + ninos;
  const paxLabel = es
    ? `${viajeros} ${viajeros === 1 ? 'viajero' : 'viajeros'}`
    : `${viajeros} ${viajeros === 1 ? 'traveler' : 'travelers'}`;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const p = new URLSearchParams();
    if (destino.trim()) p.set('destino', destino.trim());
    if (desde) p.set('desde', desde);
    if (tipo === 'hospedajes' && hasta) p.set('hasta', hasta);
    if (adultos) p.set('adultos', String(adultos));
    if (ninos) p.set('ninos', String(ninos));
    navigate(`/${tipo}?${p.toString()}`);
  }

  return (
    <form onSubmit={submit} className={`w-full max-w-3xl ${className}`}>
      <div className="mb-2 inline-flex rounded-full bg-black/25 p-1 backdrop-blur-sm">
        {(['hospedajes', 'tours'] as Tipo[]).map((tt) => (
          <button
            key={tt}
            type="button"
            onClick={() => setTipo(tt)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
              tipo === tt ? 'bg-white text-ink' : 'text-white/90 hover:text-white'
            }`}
          >
            {tt === 'hospedajes' ? (es ? 'Hospedajes' : 'Stays') : 'Tours'}
          </button>
        ))}
      </div>

      <div className="flex flex-col divide-y divide-line overflow-visible rounded-[20px] bg-white shadow-pop lg:flex-row lg:divide-x lg:divide-y-0">
        <Segment icon={MapPin} label={es ? 'Destino' : 'Where'} className="lg:flex-[1.6]">
          <input
            list="tc-destinos"
            value={destino}
            onChange={(e) => setDestino(e.target.value)}
            placeholder={es ? 'Cartagena, Medellín…' : 'Cartagena, Medellín…'}
            className="w-full bg-transparent text-sm font-semibold text-ink placeholder:font-normal placeholder:text-muted focus:outline-none"
          />
          <datalist id="tc-destinos">
            {POPULAR.map((d) => (
              <option key={d} value={d} />
            ))}
          </datalist>
        </Segment>

        <Segment
          icon={Calendar}
          label={tipo === 'hospedajes' ? (es ? 'Entrada' : 'Check-in') : es ? 'Fecha' : 'Date'}
          className="lg:flex-1"
        >
          <input
            type="date"
            min={todayISO()}
            value={desde}
            onChange={(e) => {
              setDesde(e.target.value);
              if (hasta && e.target.value > hasta) setHasta('');
            }}
            className="w-full bg-transparent text-sm font-semibold text-ink focus:outline-none"
          />
        </Segment>

        {tipo === 'hospedajes' && (
          <Segment icon={Calendar} label={es ? 'Salida' : 'Check-out'} className="lg:flex-1">
            <input
              type="date"
              min={desde || todayISO()}
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
              className="w-full bg-transparent text-sm font-semibold text-ink focus:outline-none"
            />
          </Segment>
        )}

        <div className="relative lg:flex-1" ref={paxRef}>
          <button
            type="button"
            onClick={() => setPaxOpen((v) => !v)}
            className="flex w-full items-center gap-2.5 px-4 py-3 text-left"
          >
            <Users className="h-5 w-5 shrink-0 text-brand" strokeWidth={1.75} />
            <span className="min-w-0 flex-1">
              <span className="block text-overline text-muted">{es ? 'Viajeros' : 'Guests'}</span>
              <span className="block text-sm font-semibold text-ink">{paxLabel}</span>
            </span>
          </button>

          {paxOpen && (
            <div className="absolute left-0 right-0 top-full z-20 mt-2 rounded-2xl border border-line bg-white p-4 shadow-pop sm:left-auto sm:right-0 sm:w-64">
              <Stepper
                label={es ? 'Adultos' : 'Adults'}
                value={adultos}
                set={setAdultos}
                min={1}
              />
              <Stepper
                label={es ? 'Niños' : 'Children'}
                hint={es ? '0 a 12 años' : 'Ages 0–12'}
                value={ninos}
                set={setNinos}
              />
              <button
                type="button"
                onClick={() => setPaxOpen(false)}
                className="mt-2 w-full rounded-lg bg-surface py-2 text-sm font-semibold text-ink hover:bg-line"
              >
                {es ? 'Listo' : 'Done'}
              </button>
            </div>
          )}
        </div>

        <div className="p-2">
          <button
            type="submit"
            className="flex h-full w-full items-center justify-center gap-2 rounded-2xl bg-brand px-6 py-3 text-sm font-bold text-white transition hover:bg-brand-hover sm:w-auto"
          >
            <Search className="h-4 w-4" strokeWidth={2.25} />
            {es ? 'Buscar' : 'Search'}
          </button>
        </div>
      </div>
    </form>
  );
}
