/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta de Hellominus, la misma de la portada (src/home/tokens.css).
        // `brand` es el verde hoja: enlaces, chips activos, etiquetas y foco
        // (8,7:1 sobre crema). Los botones principales van en tinta (`ink`).
        brand: {
          DEFAULT: '#2F4B37',
          hover: '#243A2A',
          deep: '#1B2B20',
          tint: '#E6ECE3',
          logo: '#2F4B37',
          // Texto sobre fondo verde (barra del panel de anfitrión): 8,4:1 y 5,4:1.
          on: '#EEF1E9',
          'on-muted': '#B9C7B5',
        },
        // Acento neutro, para destacar sin competir con el verde.
        accent: {
          DEFAULT: '#22211E',
          hover: '#243A2A',
          tint: '#F6F3EC',
        },
        // Errores y avisos. El rojo acá es convención de accesibilidad, no marca.
        alert: {
          DEFAULT: '#B91C1C',
          tint: '#FEF2F2',
        },
        surface: '#F6F3EC',
        stone: '#E9E5DD',
        ink: '#22211E',
        muted: '#5E5A53',
        line: '#E1DBD0',
        success: {
          DEFAULT: '#047857',
          tint: '#ECFDF5',
        },
        // Estados pendientes ("en revisión", "pendiente de pago"): 5,8:1 sobre su tinte.
        warn: {
          DEFAULT: '#7A5212',
          tint: '#F5EAD3',
        },
      },
      fontFamily: {
        sans: ['Figtree', 'Helvetica Neue', 'Arial', 'sans-serif'],
        serif: ['Newsreader', 'Georgia', 'serif'],
        // Manuscrita de la marca (los "hand" verdes de la portada).
        hand: ['Caveat', 'Segoe Print', 'cursive'],
      },
      // Escala subida respecto del diseño anterior: el cuerpo arranca en 16px
      // para que el sitio se lea sin esfuerzo a cualquier edad.
      fontSize: {
        overline: ['0.8125rem', { lineHeight: '1.125rem', letterSpacing: '0.12em', fontWeight: '700' }],
        caption: ['0.875rem', { lineHeight: '1.25rem' }],
        'body-sm': ['0.9375rem', { lineHeight: '1.5rem' }],
        body: ['1rem', { lineHeight: '1.65rem' }],
        h3: ['1.5rem', { lineHeight: '1.9rem', letterSpacing: '-0.005em', fontWeight: '400' }],
        h2: ['2.4rem', { lineHeight: '2.6rem', letterSpacing: '-0.015em', fontWeight: '300' }],
        h1: ['3.2rem', { lineHeight: '3.4rem', letterSpacing: '-0.015em', fontWeight: '300' }],
        display: ['4.2rem', { lineHeight: '4.3rem', letterSpacing: '-0.02em', fontWeight: '300' }],
      },
      borderRadius: {
        card: '14px',
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
