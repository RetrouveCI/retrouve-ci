/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        green: {
          DEFAULT: '#1E7F43',
          light: '#2A9D54',
          dark: '#166335',
          soft: 'rgba(30,127,67,0.10)',
          soft2: 'rgba(30,127,67,0.16)',
        },
        orange: {
          DEFAULT: '#F57C00',
          light: '#FF9800',
          dark: '#E65100',
          soft: 'rgba(245,124,0,0.12)',
          soft2: 'rgba(245,124,0,0.18)',
        },
        bg: { DEFAULT: '#F1F4F1', dark: '#0C100E' },
        surface: {
          DEFAULT: '#FFFFFF',
          2: '#F7F9F7',
          3: '#EEF1EE',
          dark: '#161C18',
          d2: '#1B221E',
          d3: '#232B26',
        },
        text: {
          DEFAULT: '#14171A',
          2: '#565E59',
          3: '#8A938C',
          dark: '#ECF0EC',
          d2: '#9AA39C',
          d3: '#69736C',
        },
        border: {
          DEFAULT: 'rgba(20,23,26,0.08)',
          2: 'rgba(20,23,26,0.14)',
          dark: 'rgba(255,255,255,0.09)',
          d2: 'rgba(255,255,255,0.16)',
        },
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        '2xl': '16px',
        '3xl': '22px',
      },
      fontFamily: {
        sans: ['Geist', 'System'],
        light: ['Geist-Light'],
        medium: ['Geist-Medium'],
        semibold: ['Geist-SemiBold'],
        bold: ['Geist-Bold'],
      },
    },
  },
  plugins: [],
};
