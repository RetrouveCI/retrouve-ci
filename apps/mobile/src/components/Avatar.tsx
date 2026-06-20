import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Image } from 'react-native';

import { usePalette } from '@/design/useScheme';

import { Txt } from './Txt';

interface AvatarProps {
  name?: string | null;
  uri?: string | null;
  size?: number;
  /** Orange gradient instead of the default green. */
  accent?: boolean;
}

/** Derive up-to-two uppercase initials from a full name. */
function initials(name?: string | null) {
  if (!name) return '?';
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

/** Circular avatar — gradient brand fill with initials, or an image when set. */
export function Avatar({ name, uri, size = 44, accent = false }: AvatarProps) {
  const palette = usePalette();
  if (uri) {
    return (
      <Image source={{ uri }} style={{ width: size, height: size, borderRadius: size / 2 }} />
    );
  }
  const gradient = accent
    ? [palette.orangeLight, palette.orangeDark]
    : [palette.greenLight, palette.greenDark];
  return (
    <LinearGradient
      colors={gradient as [string, string]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Txt weight="bold" style={{ color: '#FFFFFF', fontSize: size * 0.36 }}>
        {initials(name)}
      </Txt>
    </LinearGradient>
  );
}
