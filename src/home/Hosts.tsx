import styles from './Hosts.module.css';

export default function Hosts() {
  return (
    <section id="anfitriones" className={styles.strip} aria-label="Para anfitriones">
      <p>¿Tienes casas o apartamentos para alquilar por noches?</p>
      <a href="#anfitriones">Publicar mi casa</a>
    </section>
  );
}
