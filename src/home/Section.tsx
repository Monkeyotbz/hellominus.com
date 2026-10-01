import type { ReactNode } from 'react';
import styles from './Section.module.css';

interface SectionProps {
  id?: string;
  label?: string;
  className?: string;
  /** Sin línea superior (para bloques que ya tienen fondo propio). */
  bare?: boolean;
  children: ReactNode;
}

/** Contenedor de bloque: aire vertical, márgenes laterales y línea superior. */
export function Section({ id, label, className, bare, children }: SectionProps) {
  const cls = [styles.section, bare ? styles.bare : '', className ?? ''].filter(Boolean).join(' ');
  return (
    <section id={id} aria-label={label} className={cls}>
      {children}
    </section>
  );
}

interface SectionHeadProps {
  hand: string;
  title: string;
  centered?: boolean;
}

export function SectionHead({ hand, title, centered }: SectionHeadProps) {
  return (
    <div className={[styles.head, centered ? styles.centered : ''].filter(Boolean).join(' ')}>
      <p className={styles.hand}>{hand}</p>
      <h2 className={styles.title}>{title}</h2>
    </div>
  );
}

/** Nota que aclara que el dato mostrado es de ejemplo. */
export function ExampleNote({ children }: { children: ReactNode }) {
  return <p className={styles.example}>{children}</p>;
}
