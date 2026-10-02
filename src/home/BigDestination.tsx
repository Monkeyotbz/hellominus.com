import Button from './Button';
import { useHomeStore } from './store';
import styles from './BigDestination.module.css';

export default function BigDestination() {
  const setCompleteTab = useHomeStore((s) => s.setCompleteTab);

  return (
    <section id="destino" className={styles.wrap} aria-label="Destino destacado">
      <img
        className={styles.photo}
        src="/home/dest-rosario.jpg"
        alt="Isla de las Islas del Rosario rodeada de aguas turquesa."
        width={1472}
        height={669}
        loading="lazy"
      />
      <div className={styles.copy}>
        <p className={styles.hand}>destino del mes</p>
        <h2 className={styles.title}>Islas del Rosario</h2>
        <p className={styles.lead}>Cuatro islas en un día, con transporte desde Cartagena.</p>
        <Button variant="light" href="#completa" onClick={() => setCompleteTab('planes')}>
          Ver el plan
        </Button>
      </div>
    </section>
  );
}
