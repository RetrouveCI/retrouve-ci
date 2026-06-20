import { useColorScheme } from 'react-native';

import { useAppStore } from '@/store/app.store';

import { paletteFor, type ColorScheme } from './tokens';

/**
 * Resolves the active color scheme from the user's theme preference
 * ('light' | 'dark' | 'auto') combined with the OS color scheme.
 */
export function useScheme(): ColorScheme {
  const theme = useAppStore((s) => s.theme);
  const system = useColorScheme();
  if (theme === 'auto') return system === 'dark' ? 'dark' : 'light';
  return theme;
}

/** Returns the resolved palette (surfaces/text/brand) for the active scheme. */
export function usePalette() {
  const scheme = useScheme();
  return paletteFor(scheme);
}
