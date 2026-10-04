import { Link } from 'react-router-dom';
import styles from './Hosts.module.css';

export default function Hosts() {
  return (
    <section id="anfitriones" className={`${styles.strip} tone-stone`} aria-label="Para anfitriones">
      <p>¿Tienes hospedajes para alquilar por noches?</p>
      <Link to="/anfitriones">Publicar mi hospedaje</Link>
    </section>
  );
}
