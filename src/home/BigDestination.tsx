import Button from './Button';
import { useLazyVideo } from './hooks';
import { useHomeStore } from './store';
import styles from './BigDestination.module.css';

export default function BigDestination() {
  const setCompleteTab = useHomeStore((s) => s.setCompleteTab);
  const video = useLazyVideo();

  return (
    <section id="destino" className={styles.wrap} aria-label="Destino destacado">
      {/* Decorativo: se descarga al acercarse a la sección (ver useLazyVideo). */}
      <video
        ref={video.ref}
        className={styles.photo}
        src={video.load ? '/destino/rosario.mp4' : undefined}
        poster="/destino/rosario.jpg"
        autoPlay
        muted
        loop
        playsInline
        preload="none"
        aria-hidden="true"
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
