import type { ComponentType, SVGProps } from 'react';

type LucideProps = SVGProps<SVGSVGElement> & { size?: number | string; strokeWidth?: number | string };

const SIZES = { sm: 16, md: 20, lg: 24, xl: 28 } as const;

/**
 * Envoltura única para iconos de lucide-react: tamaño y grosor de trazo
 * consistentes en todo el sitio. Usar en vez de <Foo className="h-3.5 w-3.5" />.
 *
 *   <Icon as={MapPin} />            // 20px
 *   <Icon as={Star} size="sm" />    // 16px
 */
export default function Icon({
  as: Cmp,
  size = 'md',
  className = '',
  ...rest
}: {
  as: ComponentType<LucideProps>;
  size?: keyof typeof SIZES;
  className?: string;
} & Omit<LucideProps, 'ref'>) {
  const px = SIZES[size];
  return <Cmp width={px} height={px} strokeWidth={1.75} className={className} {...rest} />;
}
