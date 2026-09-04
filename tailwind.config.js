/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'primary-blue': '#1E3A5F',
        'accent-blue': '#2E9FE0',
        'ice-white': '#F5F5F5',
        ink: '#1A1A1A',
        silver: '#D7DADD',
        'silver-dark': '#242629',
        streak: '#E8752B',
        token: '#D9A83B',
        heart: '#D6564F',
        success: '#4C9A6A',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        display: ['"Cormorant Garamond"', 'serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      boxShadow: {
        card: '0 8px 30px rgb(0,0,0,0.06)',
        pop: '0 4px 0 0 rgb(0,0,0,0.15)',
        floating: '0 40px 80px -16px rgb(0,0,0,0.5), 0 18px 36px -10px rgb(0,0,0,0.35)',
      },
      keyframes: {
        'pop-in': {
          '0%': { transform: 'scale(0.85)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'flame-flicker': {
          '0%, 100%': { transform: 'scale(1) rotate(-2deg)' },
          '50%': { transform: 'scale(1.08) rotate(2deg)' },
        },
      },
      animation: {
        'pop-in': 'pop-in 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'flame-flicker': 'flame-flicker 1.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
