import React from 'react';
import { Image, View } from 'react-native';

import { usePalette } from '@/design/useScheme';

import { Txt } from './Txt';

interface AvatarProps {
  name?: string | null;
  uri?: string | null;
  size?: number;
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

/** Circular user avatar — image when available, initials fallback otherwise. */
export function Avatar({ name, uri, size = 40 }: AvatarProps) {
  const palette = usePalette();
  if (uri) {
    return <Image source={{ uri }} style={{ width: size, height: size, borderRadius: size / 2 }} />;
  }
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: palette.greenSoft,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Txt weight="semibold" style={{ color: palette.green, fontSize: size * 0.4 }}>
        {initials(name)}
      </Txt>
    </View>
  );
}
