import type { ReactNode } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Check } from 'lucide-react';

/*
 * Piezas compartidas por los paneles (/cuenta del viajero y /panel del
 * anfitrión). Mismo lenguaje que la portada: crema, tinta, verde hoja,
 * Newsreader para títulos, Figtree para texto y Caveat para los acentos.
 */

/** Rótulo en versalitas, como los de la barra de búsqueda de la portada. */
export function Eyebrow({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <p className={`text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-muted ${className}`}>{children}</p>;
}

/** Acento manuscrito verde ("hola de nuevo", "tu próximo viaje"…). */
export function Hand({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <p className={`font-hand text-[1.35rem] font-semibold leading-none text-brand ${className}`}>{children}</p>;
}

export function PageHeader({
  hand,
  title,
  meta,
  actions,
}: {
  hand?: ReactNode;
  title: ReactNode;
  meta?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {hand && <Hand className="mb-1.5">{hand}</Hand>}
        <h1 className="font-serif text-[2.1rem] font-light leading-tight text-ink sm:text-[2.6rem]">{title}</h1>
        {meta && <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">{meta}</div>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

/** Tarjeta de sección: fondo blanco, borde cálido. */
export function Card({
  title,
  eyebrow,
  action,
  children,
  className = '',
  bodyClassName = 'p-5 sm:p-6',
}: {
  title?: ReactNode;
  eyebrow?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={`min-w-0 rounded-card border border-line bg-white ${className}`}>
      {(title || eyebrow || action) && (
        <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-4 sm:px-6">
          <div className="min-w-0">
            {eyebrow && <Eyebrow className="mb-1">{eyebrow}</Eyebrow>}
            {title && <h2 className="font-serif text-[1.35rem] font-normal leading-snug text-ink">{title}</h2>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}

export type Tone = 'success' | 'warn' | 'alert' | 'neutral' | 'ink';

const TONE: Record<Tone, string> = {
  success: 'bg-brand-tint text-brand',
  warn: 'bg-warn-tint text-warn',
  alert: 'bg-alert-tint text-alert',
  neutral: 'bg-stone text-muted',
  ink: 'bg-ink text-surface',
};

/** Etiqueta de estado (reserva, publicación, espacio). */
export function StatusChip({ tone, children, className = '' }: { tone: Tone; children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${TONE[tone]} ${className}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {children}
    </span>
  );
}

/** Indicador grande (Newsreader) con su rótulo. */
export function Stat({ value, label, hint, to }: { value: ReactNode; label: string; hint?: string; to?: string }) {
  const body = (
    <>
      <span className="block break-words font-serif text-[1.75rem] font-light leading-none text-ink sm:text-[2.4rem]">{value}</span>
      <span className="mt-2 block text-sm text-ink">{label}</span>
      {hint && <span className="block text-xs text-muted">{hint}</span>}
    </>
  );
  const cls = 'block min-w-0 rounded-card border border-line bg-white p-4 transition sm:p-5';
  return to ? (
    <Link to={to} className={`${cls} hover:border-brand/40 hover:shadow-card`}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}

export function EmptyState({
  icon,
  title,
  text,
  action,
}: {
  icon?: ReactNode;
  title: string;
  text?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-card border border-dashed border-line bg-white px-6 py-12 text-center">
      {icon && <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-stone text-brand">{icon}</div>}
      <p className="font-serif text-[1.35rem] text-ink">{title}</p>
      {text && <p className="mt-1.5 max-w-sm text-sm text-muted">{text}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/** Pestañas de navegación con subrayado (como "Planes de turismo · Mercado"). */
export function Tabs({ items }: { items: { to: string; label: string; end?: boolean; count?: number }[] }) {
  return (
    <nav className="-mb-px flex gap-6 overflow-x-auto border-b border-line" aria-label="Secciones">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            `shrink-0 border-b-2 pb-3 pt-1 text-[15px] transition ${
              isActive ? 'border-ink font-medium text-ink' : 'border-transparent text-muted hover:text-ink'
            }`
          }
        >
          {item.label}
          {item.count != null && <span className="ml-1.5 text-xs text-muted">{item.count}</span>}
        </NavLink>
      ))}
    </nav>
  );
}

/** Filtro de opciones excluyentes (píldoras). */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: T; label: string; count?: number }[];
  value: T;
  onChange: (value: T) => void;
  label: string;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label={label}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={o.value === value}
          onClick={() => onChange(o.value)}
          className={`rounded-full border px-4 py-1.5 text-sm transition ${
            o.value === value ? 'border-ink bg-ink text-surface' : 'border-line bg-white text-ink hover:border-ink/40'
          }`}
        >
          {o.label}
          {o.count != null && <span className={`ml-1.5 text-xs ${o.value === value ? 'text-surface/70' : 'text-muted'}`}>{o.count}</span>}
        </button>
      ))}
    </div>
  );
}

/** Barra de avance. `onDark` para usarla sobre el verde de la marca. */
export function ProgressBar({ value, label, onDark = false }: { value: number; label: string; onDark?: boolean }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div>
      <div className={`flex justify-between text-xs ${onDark ? 'text-brand-on-muted' : 'text-muted'}`}>
        <span>{label}</span>
        <span>{pct}%</span>
      </div>
      <div
        className={`mt-1.5 h-1.5 overflow-hidden rounded-full ${onDark ? 'bg-white/20' : 'bg-stone'}`}
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div className={`h-full rounded-full transition-all ${onDark ? 'bg-brand-on' : 'bg-brand'}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export interface ChecklistStep {
  label: string;
  done: boolean;
  hint?: string;
  to?: string;
}

/** Pasos con avance (completar perfil, preparar el espacio…). */
export function Checklist({ steps }: { steps: ChecklistStep[] }) {
  return (
    <ol className="space-y-1">
      {steps.map((s, i) => {
        const inner = (
          <>
            <span
              className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs ${
                s.done ? 'border-brand bg-brand text-brand-on' : 'border-line bg-white text-muted'
              }`}
              aria-hidden="true"
            >
              {s.done ? <Check className="h-3.5 w-3.5" /> : i + 1}
            </span>
            <span className="min-w-0">
              <span className={`block text-sm ${s.done ? 'text-muted line-through decoration-line' : 'text-ink'}`}>{s.label}</span>
              {s.hint && !s.done && <span className="block text-xs text-muted">{s.hint}</span>}
            </span>
            <span className="sr-only">{s.done ? '(hecho)' : '(pendiente)'}</span>
          </>
        );
        return (
          <li key={s.label}>
            {s.to && !s.done ? (
              <Link to={s.to} className="flex gap-3 rounded-lg px-2 py-2 transition hover:bg-surface">
                {inner}
              </Link>
            ) : (
              <div className="flex gap-3 px-2 py-2">{inner}</div>
            )}
          </li>
        );
      })}
    </ol>
  );
}

/** Foto de perfil o iniciales. */
export function Avatar({ name, src, size = 48, className = '' }: { name?: string | null; src?: string | null; size?: number; className?: string }) {
  const initials =
    (name ?? '')
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? '')
      .join('') || '·';
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-tint font-serif text-brand ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
      aria-hidden="true"
    >
      {src ? <img src={src} alt="" className="h-full w-full object-cover" /> : initials}
    </span>
  );
}
