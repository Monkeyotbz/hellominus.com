import { Link } from 'react-router-dom';
import styles from './About.module.css';

export default function About() {
  return (
    <section id="historia" className={`${styles.wrap} tone-light`} aria-label="Quiénes somos">
      <p className={styles.hand}>quiénes somos</p>
      <h2 className={styles.title}>Nuestra historia</h2>
      <p className={styles.text}>
        Somos una compañía ideada para todas las personas que quieren disfrutar de grandes experiencias y buscan confort y comodidad en
        propiedades ubicadas dentro de un ecosistema ecoturístico.
      </p>
      <Link className={styles.btn} to="/nosotros">
        Conocer Hellominus
      </Link>
    </section>
  );
}
