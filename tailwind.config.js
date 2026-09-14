/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Énfasis principal — del pin del isotipo (public/brand/mark.svg).
        // DEFAULT es una versión más profunda que el coral real del logo
        // (#F06C5F, ver brand.logo): ese tono puro da solo 2.99:1 sobre
        // blanco, insuficiente para texto/botones. DEFAULT en cambio pasa
        // AA (>= 4.5:1) — se usa para todo lo interactivo (botones, links,
        // foco); brand.logo se reserva para el isotipo en sí.
        brand: {
          DEFAULT: '#D1402C',
          hover: '#B8371F',
          deep: '#7A2415',
          tint: '#FCEEEA',
          logo: '#F06C5F',
        },
        // Acento secundario, para destacar sin gritar. Cálido/frío con el
        // coral principal a propósito.
        accent: {
          DEFAULT: '#0E7490',
          hover: '#155E75',
          tint: '#ECFEFF',
        },
        // Errores y avisos. El rojo acá es convención de accesibilidad, no marca.
        alert: {
          DEFAULT: '#B91C1C',
          tint: '#FEF2F2',
        },
        surface: '#F8FAFC',
        ink: '#333F47',
        muted: '#5B6B74',
        line: '#E2E8F0',
        success: {
          DEFAULT: '#047857',
          tint: '#ECFDF5',
        },
      },
      fontFamily: {
        sans: ['Manrope', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        serif: ['Manrope', 'system-ui', 'sans-serif'],
      },
      // Escala subida respecto del diseño anterior: el cuerpo arranca en 16px
      // para que el sitio se lea sin esfuerzo a cualquier edad.
      fontSize: {
        overline: ['0.8125rem', { lineHeight: '1.125rem', letterSpacing: '0.12em', fontWeight: '700' }],
        caption: ['0.875rem', { lineHeight: '1.25rem' }],
        'body-sm': ['0.9375rem', { lineHeight: '1.5rem' }],
        body: ['1rem', { lineHeight: '1.65rem' }],
        h3: ['1.375rem', { lineHeight: '1.9rem', letterSpacing: '-0.01em', fontWeight: '700' }],
        h2: ['2rem', { lineHeight: '2.4rem', letterSpacing: '-0.015em', fontWeight: '700' }],
        h1: ['2.75rem', { lineHeight: '3rem', letterSpacing: '-0.02em', fontWeight: '800' }],
        display: ['3.75rem', { lineHeight: '3.9rem', letterSpacing: '-0.025em', fontWeight: '800' }],
      },
      borderRadius: {
        card: '16px',
        pill: '999px',
      },
      // Altura mínima de los objetivos táctiles (WCAG 2.5.5).
      minHeight: {
        touch: '44px',
      },
      minWidth: {
        touch: '44px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(15,23,42,.04), 0 10px 26px -14px rgba(15,23,42,.20)',
        hover: '0 2px 6px rgba(15,23,42,.06), 0 20px 44px -18px rgba(15,23,42,.30)',
        nav: '0 1px 0 rgba(15,23,42,.06)',
        pop: '0 26px 64px -22px rgba(15,23,42,.36)',
      },
      maxWidth: {
        site: '1280px',
      },
      keyframes: {
        'fade-in-down': {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'fade-in-down': 'fade-in-down 0.3s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
      },
    },
  },
  plugins: [],
};
