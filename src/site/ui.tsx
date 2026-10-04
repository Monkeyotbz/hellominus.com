import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';

export function Container({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`mx-auto w-full max-w-site px-4 sm:px-6 lg:px-10 ${className}`}>{children}</div>;
}

export function Eyebrow({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <p
      className={`text-overline uppercase ${dark ? 'text-brand-tint' : 'text-brand'}`}
    >
      {children}
    </p>
  );
}

type Variant = 'primary' | 'accent' | 'outline' | 'white';
type Size = 'md' | 'lg';

// Botones grandes a propósito: objetivos táctiles cómodos y etiqueta legible
// sin forzar la vista.
const btnBase =
  'inline-flex min-h-touch items-center justify-center gap-2 rounded-none border font-medium tracking-[0.05em] transition-colors disabled:opacity-60';
const btnSize: Record<Size, string> = {
  md: 'px-6 py-3 text-body',
  lg: 'px-8 py-4 text-[1.0625rem]',
};
const btnVariant: Record<Variant, string> = {
  // Igual que los botones de la portada (src/home/Button.module.css): rectos, en tinta.
  primary: 'border-ink bg-ink text-surface hover:border-brand-hover hover:bg-brand-hover',
  accent: 'border-brand bg-brand text-surface hover:border-brand-hover hover:bg-brand-hover',
  outline: 'border-ink bg-transparent text-ink hover:bg-ink hover:text-surface',
  white: 'border-white bg-white text-ink hover:bg-surface',
};

export function buttonClasses(variant: Variant = 'primary', size: Size = 'md', className = '') {
  return `${btnBase} ${btnSize[size]} ${btnVariant[variant]} ${className}`;
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...rest
}: {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" className={buttonClasses(variant, size, className)} {...rest}>
      {children}
    </button>
  );
}

export function ButtonLink({
  to,
  variant = 'primary',
  size = 'md',
  className = '',
  children,
}: {
  to: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
}) {
  const isExternal = /^https?:|^mailto:|^tel:/.test(to);
  const cls = buttonClasses(variant, size, className);
  return isExternal ? (
    <a href={to} className={cls} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ) : (
    <Link to={to} className={cls}>
      {children}
    </Link>
  );
}

export function Stars({ rating, count }: { rating?: number | null; count?: number | null }) {
  if (rating == null) return null;
  const label = `${rating.toFixed(rating % 1 === 0 ? 0 : 2)} de 5${
    count != null ? `, ${count} opiniones` : ''
  }`;
  return (
    <span className="inline-flex items-center gap-1 text-body-sm text-ink" aria-label={label}>
      <Star className="h-4 w-4 fill-accent text-accent" aria-hidden="true" />
      <b>{rating.toFixed(rating % 1 === 0 ? 0 : 2)}</b>
      {count != null && <span className="text-muted">({count})</span>}
    </span>
  );
}

export function Money({ value, suffix }: { value?: number | null; suffix?: string }) {
  if (value == null) return <span className="font-semibold">Consultar</span>;
  return (
    <span>
      <b>${value.toLocaleString('es-CO')}</b>
      {suffix && <span className="text-muted"> {suffix}</span>}
    </span>
  );
}

export function Badge({
  children,
  tone = 'brand',
}: {
  children: React.ReactNode;
  tone?: 'alert' | 'brand';
}) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-caption font-bold tracking-wide text-white ${
        tone === 'alert' ? 'bg-alert' : 'bg-brand'
      }`}
    >
      {children}
    </span>
  );
}
