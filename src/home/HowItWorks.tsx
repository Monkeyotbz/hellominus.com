import type { ReactNode } from 'react';
import Button from './Button';
import { HomeIcon, LockIcon, PinIcon } from './Icons';
import { ExampleNote } from './Section';
import styles from './HowItWorks.module.css';

interface Step {
  id: string;
  icon: ReactNode;
  title: string;
  lead: string;
  points: string[];
}

const STEPS: Step[] = [
  {
    id: 'elige',
    icon: <HomeIcon />,
    title: 'Elige',
    lead: 'Hospedajes verificados, con Wi-Fi medido.',
    points: ['Visitamos cada hospedaje', 'Fotos reales, sin retoques', 'Wi-Fi medido en cada uno'],
  },
  {
    id: 'reserva',
    icon: <LockIcon />,
    title: 'Reserva',
    lead: 'Pago seguro y cancelación flexible.',
    points: ['Pago en línea protegido', 'Cancelas sin costo hasta 5 días antes', 'Plan y mercado en el mismo pago'],
  },
  {
    id: 'llega',
    icon: <PinIcon />,
    title: 'Llega',
    lead: 'Te acompañamos por WhatsApp.',
    points: ['Llegada coordinada contigo', 'Una persona real responde', 'Ayuda durante toda tu estadía'],
  },
];

export default function HowItWorks() {
  return (
    <section id="comofunciona" className={`${styles.how} tone-stone`} aria-label="Cómo funciona">
      <div className={styles.head}>
        <p className={styles.hand}>cómo funciona</p>
        <h2 className={styles.title}>Reservar es así de simple</h2>
      </div>
      <ol className={styles.steps}>
        {STEPS.map((step, index) => (
          <li key={step.id} className={styles.card}>
            <span className={styles.icon}>{step.icon}</span>
            <p className={styles.step}>paso {index + 1}</p>
            <h3 className={styles.name}>{step.title}</h3>
            <p className={styles.lead}>{step.lead}</p>
            <ul className={styles.points}>
              {step.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
      <div className={styles.cta}>
        <Button href="#estadia">Ver estadías</Button>
        <ExampleNote>Condiciones de ejemplo hasta definir las reales.</ExampleNote>
      </div>
    </section>
  );
}
