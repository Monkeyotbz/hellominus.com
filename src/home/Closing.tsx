import Button from './Button';
import styles from './Closing.module.css';

export default function Closing() {
  return (
    <section id="cierre" className={styles.wrap} aria-label="Cierre">
      <h2 className={styles.title}>Elige tu casa y empieza a viajar con calma</h2>
      <Button href="#estadia">Ver estadías</Button>
    </section>
  );
}
