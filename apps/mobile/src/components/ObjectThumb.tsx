import React from 'react';
import { Image, View, type ViewStyle } from 'react-native';
import Svg, { Defs, Line, Pattern, Rect } from 'react-native-svg';

import { Icon, type IconName } from '@/design/Icon';
import { fontFamily } from '@/design/fonts';
import { usePalette } from '@/design/useScheme';
import type { ObjectTone } from '@/services/types';

import { Txt } from './Txt';

const TONE_META: Record<ObjectTone, { icon: IconName; hue: 'green' | 'orange'; label: string }> = {
  doc: { icon: 'tag', hue: 'green', label: 'PAPIERS' },
  key: { icon: 'qr', hue: 'orange', label: 'CLÉS' },
  phone: { icon: 'camera', hue: 'green', label: 'ÉLECTRONIQUE' },
  bag: { icon: 'package', hue: 'orange', label: 'BAGAGE' },
};

interface ObjectThumbProps {
  tone?: ObjectTone;
  radius?: number;
  iconSize?: number;
  showLabel?: boolean;
  /** When set, shows a real photo instead of the striped placeholder. */
  uri?: string | null;
  style?: ViewStyle;
}

/** Tinted, diagonally-striped placeholder image keyed by object category. */
export function ObjectThumb({
  tone = 'doc',
  radius = 14,
  iconSize = 26,
  showLabel = false,
  uri,
  style,
}: ObjectThumbProps) {
  const palette = usePalette();
  const meta = TONE_META[tone] ?? TONE_META.doc;
  const hue = meta.hue === 'orange' ? palette.orange : palette.green;
  const patternId = `stripe-${tone}`;

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[{ borderRadius: radius, backgroundColor: palette.surface3 }, style as object]}
        resizeMode="cover"
      />
    );
  }

  return (
    <View
      style={[
        {
          overflow: 'hidden',
          borderRadius: radius,
          backgroundColor: palette.surface3,
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
    >
      <Svg width="100%" height="100%" style={{ position: 'absolute', opacity: 0.5 }}>
        <Defs>
          <Pattern
            id={patternId}
            width={9}
            height={9}
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <Line x1={0} y1={0} x2={0} y2={9} stroke={hue} strokeWidth={1.4} strokeOpacity={0.18} />
          </Pattern>
        </Defs>
        <Rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </Svg>
      <View style={{ alignItems: 'center', gap: 5, opacity: 0.85 }}>
        <Icon name={meta.icon} size={iconSize} color={hue} strokeWidth={1.8} />
        {showLabel ? (
          <Txt style={{ fontFamily: fontFamily.medium, fontSize: 9, letterSpacing: 1, color: hue }}>
            {meta.label}
          </Txt>
        ) : null}
      </View>
    </View>
  );
}
