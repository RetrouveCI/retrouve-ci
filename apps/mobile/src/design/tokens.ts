/**
 * Design tokens — source of truth for the RetrouveCI mobile design system.
 * Mirrors the values used in tailwind.config.js so both StyleSheet and
 * NativeWind class names stay in sync. Extracted from the Claude Design mockup.
 */

export const colors = {
  // Brand
  green: '#1E7F43',
  greenLight: '#2A9D54',
  greenDark: '#166335',
  orange: '#F57C00',
  orangeLight: '#FF9800',
  orangeDark: '#E65100',

  // Light theme surfaces
  bg: '#F1F4F1',
  surface: '#FFFFFF',
  surface2: '#F7F9F7',
  surface3: '#EEF1EE',
  text: '#14171A',
  text2: '#565E59',
  text3: '#8A938C',
  border: 'rgba(20,23,26,0.08)',
  border2: 'rgba(20,23,26,0.14)',
  greenSoft: 'rgba(30,127,67,0.10)',
  greenSoft2: 'rgba(30,127,67,0.16)',
  orangeSoft: 'rgba(245,124,0,0.12)',
  orangeSoft2: 'rgba(245,124,0,0.18)',
  glass: 'rgba(255,255,255,0.72)',
  glassBorder: 'rgba(255,255,255,0.6)',
} as const;

export const darkColors = {
  bg: '#0C100E',
  surface: '#161C18',
  surface2: '#1B221E',
  surface3: '#232B26',
  text: '#ECF0EC',
  text2: '#9AA39C',
  text3: '#69736C',
  border: 'rgba(255,255,255,0.09)',
  border2: 'rgba(255,255,255,0.16)',
  greenSoft: 'rgba(42,157,84,0.16)',
  greenSoft2: 'rgba(42,157,84,0.24)',
  orangeSoft: 'rgba(255,152,0,0.14)',
  orangeSoft2: 'rgba(255,152,0,0.22)',
  glass: 'rgba(22,28,24,0.68)',
  glassBorder: 'rgba(255,255,255,0.08)',
} as const;

export const shadows = {
  sm: {
    shadowColor: '#10180C',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#10180C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  lg: {
    shadowColor: '#10180C',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 10,
  },
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  full: 999,
} as const;

export type ColorScheme = 'light' | 'dark';

/** Resolve the surface/text palette for the active scheme. */
export function paletteFor(scheme: ColorScheme) {
  return scheme === 'dark' ? { ...colors, ...darkColors } : colors;
}
