/** @type {import('tailwindcss').Config} */

// Los colores salen de las variables CSS definidas en src/index.css.
// El formato <alpha-value> permite usar opacidades (ej: bg-acento/10).
const color = (variable) => `rgb(var(${variable}) / <alpha-value>)`;

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        fondo: color('--fondo'),
        'fondo-alt': color('--fondo-alt'),
        superficie: color('--superficie'),
        'superficie-alt': color('--superficie-alt'),
        borde: color('--borde'),
        'borde-fuerte': color('--borde-fuerte'),
        texto: color('--texto'),
        'texto-suave': color('--texto-suave'),
        'texto-tenue': color('--texto-tenue'),
        acento: color('--acento'),
        'acento-suave': color('--acento-suave'),
        'acento-texto': color('--acento-texto'),
        exito: color('--exito'),
        alerta: color('--alerta'),
      },
      fontFamily: {
        serif: ['ui-serif', 'Georgia', 'Cambria', 'Times New Roman', 'serif'],
      },
      boxShadow: {
        suave: '0 1px 2px rgb(0 0 0 / 0.04), 0 2px 8px rgb(0 0 0 / 0.04)',
        elevada: '0 2px 4px rgb(0 0 0 / 0.05), 0 8px 24px rgb(0 0 0 / 0.08)',
      },
      transitionDuration: {
        DEFAULT: '150ms',
      },
    },
  },
  plugins: [],
};
