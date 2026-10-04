import { useId, useMemo, useState, type FormEvent } from 'react';
import Button from './Button';
import { CITIES, HERO_ASSURANCES, type City } from './data';
import { scrollToId } from './hooks';
import { useHomeStore } from './store';
import styles from './Hero.module.css';

const MIN_GUESTS = 1;
const MAX_GUESTS = 12;

function toIsoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export default function Hero() {
  const ids = { dest: useId(), arrival: useId(), departure: useId() };
  const today = useMemo(() => new Date(), []);
  // Con "reducir movimiento" activo se muestra solo el póster, sin reproducir.
  const reduceMotion = useMemo(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches, []);
  const [destination, setDestination] = useState<'todas' | City>('todas');
  const [arrival, setArrival] = useState(() => toIsoDate(addDays(today, 7)));
  const [departure, setDeparture] = useState(() => toIsoDate(addDays(today, 12)));
  const [guests, setGuests] = useState(2);
  const [note, setNote] = useState('');
  const setStayFilter = useHomeStore((s) => s.setStayFilter);
  const properties = useHomeStore((s) => s.properties);

  const onArrival = (value: string) => {
    setArrival(value);
    if (departure <= value) setDeparture(toIsoDate(addDays(new Date(`${value}T00:00:00`), 1)));
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    setStayFilter(destination);
    const shown = destination === 'todas' ? properties.length : properties.filter((p) => p.city === destination).length;
    setNote(
      `Maqueta: mostramos ${shown} ${shown === 1 ? 'hospedaje' : 'hospedajes'} de ejemplo para ${guests} ${
        guests === 1 ? 'huésped' : 'huéspedes'
      }, del ${arrival} al ${departure}. La disponibilidad real aún no se consulta.`,
    );
    scrollToId('estadia');
  };

  return (
    <section className={styles.hero} aria-label="Portada">
      {/* Video decorativo: el mensaje está en el texto, por eso va oculto a lectores de pantalla. */}
      <video
        className={styles.photo}
        src="/portada/hero.mp4"
        poster="/portada/hero.jpg"
        autoPlay={!reduceMotion}
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
      />
      <div className={styles.copy}>
        <p className={styles.hand}>para nómadas digitales y para todos</p>
        <h1 className={styles.title}>Quédate el tiempo que el lugar te pida.</h1>
        <p className={styles.sub}>
          Hospedajes por noches o por meses en Colombia, con planes y mercado local. Para <b>quienes trabajan mientras viajan</b> y para todos.
        </p>
      </div>

      <form className={styles.bar} onSubmit={onSubmit} noValidate>
        <div className={styles.field}>
          <label className={styles.label} htmlFor={ids.dest}>
            Destino
          </label>
          <select id={ids.dest} className={styles.select} value={destination} onChange={(e) => setDestination(e.target.value as 'todas' | City)}>
            <option value="todas">Todos los destinos</option>
            {CITIES.map((city) => (
              <option key={city} value={city}>
                {city === 'Jardín' ? 'Jardín, Antioquia' : city}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor={ids.arrival}>
            Llegada
          </label>
          <input id={ids.arrival} className={styles.date} type="date" min={toIsoDate(today)} value={arrival} onChange={(e) => onArrival(e.target.value)} />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor={ids.departure}>
            Salida
          </label>
          <input id={ids.departure} className={styles.date} type="date" min={arrival} value={departure} onChange={(e) => setDeparture(e.target.value)} />
        </div>
        <div className={styles.field}>
          <span className={styles.label} id="hero-guests-label">
            Huéspedes
          </span>
          <div className={styles.stepper} role="group" aria-labelledby="hero-guests-label">
            <button type="button" aria-label="Menos huéspedes" disabled={guests <= MIN_GUESTS} onClick={() => setGuests((g) => g - 1)}>
              −
            </button>
            <output aria-live="polite">{guests}</output>
            <button type="button" aria-label="Más huéspedes" disabled={guests >= MAX_GUESTS} onClick={() => setGuests((g) => g + 1)}>
              +
            </button>
          </div>
        </div>
        <Button type="submit" className={styles.go}>
          Buscar
        </Button>
        {note && (
          <p className={styles.note} role="status">
            {note}
          </p>
        )}
        <ul className={styles.assure}>
          {HERO_ASSURANCES.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </form>
    </section>
  );
}
