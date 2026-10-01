import { CITIES, formatCop, type StayFilter } from './data';
import { Section, SectionHead, ExampleNote } from './Section';
import { useHomeStore } from './store';
import styles from './Stays.module.css';

const FILTERS: { value: StayFilter; label: string }[] = [
  { value: 'todas', label: 'Todas' },
  ...CITIES.map((city) => ({ value: city as StayFilter, label: city })),
  { value: 'trabajo', label: 'Para trabajar' },
];

export default function Stays() {
  const filter = useHomeStore((s) => s.stayFilter);
  const setFilter = useHomeStore((s) => s.setStayFilter);
  const properties = useHomeStore((s) => s.properties);

  const visible = properties.filter((p) => {
    if (filter === 'todas') return true;
    if (filter === 'trabajo') return p.forWork;
    return p.city === filter;
  });

  return (
    <Section id="estadia">
      <SectionHead hand="casas para quedarte" title="Casas listas para vivir, por noches o por meses" />
      <div className={styles.chips} role="group" aria-label="Filtrar casas">
        {FILTERS.map((item) => (
          <button key={item.value} type="button" className={styles.chip} aria-pressed={filter === item.value} onClick={() => setFilter(item.value)}>
            {item.label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className={styles.empty} role="status">
          No hay casas con ese filtro todavía.
        </p>
      ) : (
        <div className={styles.grid}>
          {visible.map((p) => (
            <a key={p.id} className={styles.card} href="#estadia">
              <div className={styles.photo}>
                <img src={p.image} alt={p.alt} width={900} height={675} loading="lazy" />
                <span className={styles.tag}>{p.tag}</span>
              </div>
              <span className={styles.where}>
                {p.city} · {p.area}
              </span>
              <h3 className={styles.name}>{p.title}</h3>
              <p className={styles.meta}>
                Wi-Fi {p.wifiMbps} Mbps · mín. {p.minNights} noches
              </p>
              <span className={styles.price}>
                Desde <b>{formatCop(p.pricePerNight)}</b> por noche
              </span>
            </a>
          ))}
        </div>
      )}
      <ExampleNote>Fotos del proyecto. Nombres, precios y conexiones de ejemplo.</ExampleNote>
    </Section>
  );
}
