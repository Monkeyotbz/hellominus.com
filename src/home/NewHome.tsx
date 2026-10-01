import Button from './Button';
import { FEATURED_PROPERTY_ID, PROPERTIES, formatCop } from './data';
import { useHomeStore } from './store';
import styles from './NewHome.module.css';

export default function NewHome() {
  const featured = PROPERTIES.find((p) => p.id === FEATURED_PROPERTY_ID);
  const setStayFilter = useHomeStore((s) => s.setStayFilter);
  if (!featured) return null;

  const show = () => setStayFilter(featured.city);

  return (
    <section id="novedad" className={styles.wrap} aria-label="Novedad">
      <a className={styles.photo} href="#estadia" onClick={show} tabIndex={-1} aria-hidden="true">
        <img src="/home/feat-medellin.jpg" alt="" width={1280} height={853} loading="lazy" />
      </a>
      <div className={styles.text}>
        <span className={styles.tag}>Nueva</span>
        <p className={styles.hand}>recién publicada</p>
        <h2 className={styles.title}>Nueva casa en {featured.city}</h2>
        <p className={styles.lead}>Penthouse con piscina cubierta y Wi-Fi de {featured.wifiMbps} Mbps.</p>
        <p className={styles.meta}>
          Desde <b>{formatCop(featured.pricePerNight)}</b> por noche · mín. {featured.minNights} noches
        </p>
        <Button variant="ghost" href="#estadia" onClick={show}>
          Ver esta casa
        </Button>
        <p className={styles.example}>Casa, precio y datos de ejemplo.</p>
      </div>
    </section>
  );
}
