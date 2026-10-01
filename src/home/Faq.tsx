import { FAQ } from './data';
import styles from './Faq.module.css';

export default function Faq() {
  return (
    <section id="faq" className={styles.wrap} aria-label="Preguntas frecuentes">
      <div className={styles.head}>
        <p className={styles.hand}>preguntas frecuentes</p>
        <h2 className={styles.title}>Antes de reservar</h2>
      </div>
      <div className={styles.list}>
        {FAQ.map((item) => (
          <details key={item.id} id={item.id === 'cancelacion' ? 'cancelacion' : undefined} className={styles.item}>
            <summary>{item.question}</summary>
            <p>{item.answer}</p>
          </details>
        ))}
        <p className={styles.example}>Respuestas de ejemplo hasta definir las políticas reales.</p>
      </div>
    </section>
  );
}
