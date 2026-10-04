import Button from './Button';
import styles from './Closing.module.css';

export default function Closing() {
  return (
    <section id="cierre" className={`${styles.wrap} tone-light`} aria-label="Cierre">
      <h2 className={styles.title}>Elige tu hospedaje y empieza a viajar con calma</h2>
      <Button href="#estadia">Ver estadías</Button>
    </section>
  );
}
