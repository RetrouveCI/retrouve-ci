/**
 * Geist font family — loaded at runtime via expo-font (`useFonts`) and also
 * embedded natively through the expo-font config plugin (see app.json).
 * Family names here must match the `fontFamily` entries in tailwind.config.js.
 */
export const geistFonts = {
  'Geist-Light': require('@/assets/fonts/Geist/Geist-Light.ttf'),
  Geist: require('@/assets/fonts/Geist/Geist-Regular.ttf'),
  'Geist-Medium': require('@/assets/fonts/Geist/Geist-Medium.ttf'),
  'Geist-SemiBold': require('@/assets/fonts/Geist/Geist-SemiBold.ttf'),
  'Geist-Bold': require('@/assets/fonts/Geist/Geist-Bold.ttf'),
} as const;

/** Convenience accessors for StyleSheet usage (NativeWind classes use font-*). */
export const fontFamily = {
  light: 'Geist-Light',
  regular: 'Geist',
  medium: 'Geist-Medium',
  semibold: 'Geist-SemiBold',
  bold: 'Geist-Bold',
} as const;
