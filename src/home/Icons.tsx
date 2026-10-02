import type { ReactNode, SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

function Svg({ children, ...props }: IconProps & { children: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...props}>
      {children}
    </svg>
  );
}

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

export const SearchIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="10.5" cy="10.5" r="6.5" {...stroke} />
    <path d="M15.5 15.5 21 21" {...stroke} />
  </Svg>
);

export const MenuIcon = ({ ...p }: IconProps) => (
  <svg viewBox="0 0 30 18" aria-hidden="true" focusable="false" {...p}>
    <path d="M1 2h28M1 9h28M1 16h28" fill="none" stroke="currentColor" strokeWidth={1.3} />
  </svg>
);

export const ChevronRightIcon = (p: IconProps) => (
  <svg viewBox="0 0 12 12" aria-hidden="true" focusable="false" {...p}>
    <path d="M4 2l4 4-4 4" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const HomeIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3.5 11 12 4l8.5 7" {...stroke} />
    <path d="M5.5 9.8V20h13V9.8" {...stroke} />
    <path d="M10 20v-5.5h4V20" {...stroke} />
  </Svg>
);

export const LockIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="4.5" y="10.5" width="15" height="10" rx="2" {...stroke} />
    <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" {...stroke} />
    <path d="M12 14.5v2.5" {...stroke} />
  </Svg>
);

export const PinIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z" {...stroke} />
    <circle cx="12" cy="10" r="2.4" {...stroke} />
  </Svg>
);

export const WhatsAppIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3.8 20.2l1.3-4.3a8.3 8.3 0 1 1 3.1 3L3.8 20.2Z" {...stroke} strokeWidth={1.9} />
    <path d="M9 8.6c.3 2.9 2.7 5.5 5.9 6.3l1.2-1.4-2-1-.9.7c-.9-.4-1.7-1.3-2.1-2.1l.7-.9-1-2-1.8 1.2Z" {...stroke} strokeWidth={1.9} />
  </Svg>
);

export const InstagramIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="3" width="18" height="18" rx="5" {...stroke} strokeWidth={1.9} />
    <circle cx="12" cy="12" r="4.2" {...stroke} strokeWidth={1.9} />
    <circle cx="17.4" cy="6.6" r="1.2" fill="currentColor" />
  </Svg>
);

export const FacebookIcon = (p: IconProps) => (
  <Svg {...p}>
    <path
      d="M13.5 21v-8h2.7l.5-3.3h-3.2V7.6c0-1 .4-1.7 1.8-1.7h1.5V3.1c-.3 0-1.3-.1-2.4-.1-2.5 0-4.1 1.5-4.1 4.2v2.5H7.5V13h2.8v8h3.2Z"
      fill="currentColor"
    />
  </Svg>
);

export const TikTokIcon = (p: IconProps) => (
  <Svg {...p}>
    <path
      d="M16.6 3h-3.2v11.6a2.6 2.6 0 1 1-2.6-2.6c.3 0 .5 0 .8.1V8.8a5.8 5.8 0 1 0 5 5.8V9a7 7 0 0 0 4 1.3V7.1A4.2 4.2 0 0 1 16.6 3Z"
      fill="currentColor"
    />
  </Svg>
);

export const YouTubeIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="2" y="5" width="20" height="14" rx="4.2" fill="currentColor" />
    <path d="M10 9.2v5.6l5-2.8-5-2.8Z" fill="var(--color-bg)" />
  </Svg>
);
