import { TRUST_FIGURES } from './data';
import styles from './TrustFigures.module.css';

export default function TrustFigures() {
  return (
    <section className={styles.trust} aria-label="Hellominus en cifras">
      <ul>
        {TRUST_FIGURES.map((figure) => (
          <li key={figure.id}>
            <b>{figure.value}</b>
            <span>{figure.label}</span>
          </li>
        ))}
      </ul>
      <p className={styles.example}>Cifras de ejemplo, se reemplazan por las reales.</p>
    </section>
  );
}
