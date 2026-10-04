import { Link } from 'react-router-dom';
import Button from './Button';
import { FEATURED_PROPERTY_ID, formatCop } from './data';
import { useHomeStore } from './store';
import styles from './NewHome.module.css';

export default function NewHome() {
  const properties = useHomeStore((s) => s.properties);
  const featured = properties.find((p) => p.id === FEATURED_PROPERTY_ID);
  if (!featured) return null;

  const ficha = `/hospedajes/${featured.slug}`;

  return (
    <section id="novedad" className={`${styles.wrap} tone-light`} aria-label="Novedad">
      <Link className={styles.photo} to={ficha} tabIndex={-1} aria-hidden="true">
        <img src={featured.image} alt="" width={1280} height={853} loading="lazy" />
      </Link>
      <div className={styles.text}>
        <span className={styles.tag}>Nueva</span>
        <p className={styles.hand}>recién publicada</p>
        <h2 className={styles.title}>Nuevo hospedaje en {featured.city}</h2>
        <p className={styles.lead}>Penthouse con piscina cubierta y Wi-Fi de {featured.wifiMbps} Mbps.</p>
        <p className={styles.meta}>
          Desde <b>{formatCop(featured.pricePerNight)}</b> por noche · mín. {featured.minNights} noches
        </p>
        <Button variant="ghost" href={ficha}>
          Ver este hospedaje
        </Button>
        <p className={styles.example}>Hospedaje, precio y datos de ejemplo.</p>
      </div>
    </section>
  );
}
