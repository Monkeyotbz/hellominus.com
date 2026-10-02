import Button from './Button';
import { useHomeStore } from './store';
import styles from './Nomads.module.css';

export default function Nomads() {
  const setStayFilter = useHomeStore((s) => s.setStayFilter);

  return (
    <section id="nomadas" className={styles.wrap} aria-label="Para nómadas digitales">
      <p className={styles.hand}>para nómadas digitales</p>
      <h2 className={styles.title}>Trabaja desde donde tu día se sienta mejor</h2>
      <p className={styles.facts}>Wi-Fi medido · Escritorio y silla · Tarifa mensual</p>
      <Button variant="light" href="#estadia" onClick={() => setStayFilter('trabajo')}>
        Ver casas para trabajar
      </Button>
    </section>
  );
}
