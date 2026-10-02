import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './Button.module.css';

type Variant = 'primary' | 'ghost' | 'light';
type Size = 'md' | 'sm';

interface CommonProps {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  children: ReactNode;
  className?: string;
}

type LinkProps = CommonProps & { href: string } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'className' | 'children'>;
type NativeProps = CommonProps & { href?: undefined } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'>;

function classes({ variant = 'primary', size = 'md', className }: CommonProps): string {
  return [styles.btn, styles[variant], size === 'sm' ? styles.sm : '', className ?? ''].filter(Boolean).join(' ');
}

/** Botón rectangular del diseño. Es un enlace si recibe `href`, un botón si no. */
export default function Button(props: LinkProps | NativeProps) {
  if (props.href !== undefined) {
    const { variant, size, loading, className, children, ...rest } = props;
    void loading;
    return (
      <a className={classes({ variant, size, className, children })} {...rest}>
        {children}
      </a>
    );
  }
  const { variant, size, loading, className, children, type = 'button', ...rest } = props;
  return (
    <button
      type={type}
      className={classes({ variant, size, className, children })}
      aria-busy={loading || undefined}
      disabled={loading || rest.disabled}
      {...rest}
    >
      {children}
    </button>
  );
}
