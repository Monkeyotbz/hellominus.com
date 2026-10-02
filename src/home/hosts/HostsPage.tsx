import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Button from '../Button';
import { HomeIcon, LockIcon, PinIcon } from '../Icons';
import '../tokens.css';
import HostForm from './HostForm';
import styles from './HostsPage.module.css';

const PAGE_TITLE = 'Publica tus casas en Hellominus';

const BENEFITS = [
  { id: 'estadias', icon: <PinIcon />, title: 'Estadías más largas', text: 'Atraemos a nómadas digitales y viajeros que se quedan semanas o meses.' },
  { id: 'comision', icon: <LockIcon />, title: 'Comisión clara', text: 'No pagas por publicar. Solo cobramos una comisión por cada reserva confirmada.' },
  { id: 'todo', icon: <HomeIcon />, title: 'Todo en un lugar', text: 'Tus casas, planes de turismo y mercado local en la misma plataforma.' },
];

const STEPS = [
  { id: 'cuentanos', title: 'Cuéntanos', text: 'Déjanos tus datos y cuántas propiedades tienes.' },
  { id: 'visitamos', title: 'Las visitamos', text: 'Verificamos cada casa y tomamos las fotos.' },
  { id: 'reservas', title: 'Recibes reservas', text: 'Publicamos tus casas y te avisamos de cada reserva.' },
];

/** Página para anfitriones con varias propiedades. Textos y condiciones de ejemplo. */
export default function HostsPage() {
  useEffect(() => {
    const previous = document.title;
    document.title = `${PAGE_TITLE} — Hellominus`;
    return () => {
      document.title = previous;
    };
  }, []);

  return (
    <div className="home-root">
      <header className={styles.top}>
        <Link className={styles.wordmark} to="/" aria-label="Hellominus, ir a la portada">
          Hellominus
        </Link>
        <Link className={styles.back} to="/">
          Volver a la portada
        </Link>
      </header>

      <main>
        <section className={styles.hero} aria-label="Portada de anfitriones">
          <img className={styles.photo} src="/home/feat-medellin.jpg" alt="Penthouse amplio con piscina cubierta en Medellín." width={1280} height={853} />
          <div className={styles.copy}>
            <p className={styles.hand}>para anfitriones</p>
            <h1>Publica tus casas en Hellominus.</h1>
            <p className={styles.sub}>Para quienes manejan varias propiedades. Tú cuidas las casas y nosotros traemos a los huéspedes.</p>
            <Button variant="light" href="#formulario">
              Quiero publicar mis casas
            </Button>
          </div>
        </section>

        <section className={styles.block} aria-label="Por qué publicar con Hellominus">
          <p className={styles.hand}>por qué Hellominus</p>
          <h2>Pensado para quien tiene varias casas</h2>
          <ul className={styles.benefits}>
            {BENEFITS.map((item) => (
              <li key={item.id}>
                <span className={styles.icon}>{item.icon}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </li>
            ))}
          </ul>
          <p className={styles.example}>Condiciones de ejemplo hasta definir las reales.</p>
        </section>

        <section className={`${styles.block} ${styles.alt}`} aria-label="Cómo funciona para anfitriones">
          <p className={styles.hand}>cómo funciona</p>
          <h2>Tres pasos para empezar</h2>
          <ol className={styles.steps}>
            {STEPS.map((step, index) => (
              <li key={step.id}>
                <b>{index + 1}</b>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section id="formulario" className={styles.formWrap} aria-label="Formulario para anfitriones">
          <div className={styles.formIntro}>
            <p className={styles.hand}>hablemos</p>
            <h2>Cuéntanos de tus casas</h2>
            <p>Te escribimos por WhatsApp para coordinar la visita. Sin compromiso.</p>
          </div>
          <HostForm />
        </section>
      </main>

      <footer className={styles.foot}>
        <Link className={styles.wordmark} to="/">
          Hellominus
        </Link>
        <span>© {new Date().getFullYear()} Hellominus</span>
      </footer>
    </div>
  );
}
