import { REVIEWS } from './data';
import styles from './Reviews.module.css';

export default function Reviews() {
  return (
    <section id="resenas" className={styles.wrap} aria-label="Reseñas">
      {REVIEWS.map((review) => (
        <figure key={review.id} className={styles.quote}>
          <span className={styles.stars} role="img" aria-label="5 de 5 estrellas">
            ★★★★★
          </span>
          <blockquote>
            <p>“{review.quote}”</p>
          </blockquote>
          <figcaption>{review.author}</figcaption>
        </figure>
      ))}
      <p className={styles.example}>Reseñas de ejemplo hasta tener las reales.</p>
    </section>
  );
}
