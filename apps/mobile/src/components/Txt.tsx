import React from 'react';
import { Text, type TextProps } from 'react-native';

import { fontFamily } from '@/design/fonts';
import { usePalette } from '@/design/useScheme';

type Weight = keyof typeof fontFamily;

interface TxtProps extends TextProps {
  /** Geist weight to apply. Defaults to 'regular'. */
  weight?: Weight;
  /** Token color name; falls back to primary text color. */
  tone?: 'text' | 'text2' | 'text3' | 'green' | 'orange' | 'surface';
}

/**
 * Typography primitive — applies the Geist family + a theme-aware token color.
 * Use this instead of raw <Text> so the font family stays consistent.
 */
export function Txt({ weight = 'regular', tone = 'text', style, ...rest }: TxtProps) {
  const palette = usePalette();
  const colorMap = {
    text: palette.text,
    text2: palette.text2,
    text3: palette.text3,
    green: palette.green,
    orange: palette.orange,
    surface: palette.surface,
  } as const;
  return (
    <Text style={[{ fontFamily: fontFamily[weight], color: colorMap[tone] }, style]} {...rest} />
  );
}
