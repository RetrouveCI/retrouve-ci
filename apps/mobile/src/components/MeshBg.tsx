import React, { useId } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, Ellipse, RadialGradient, Rect, Stop } from 'react-native-svg';

import { usePalette } from '@/design/useScheme';

interface MeshBgProps {
  style?: object;
  /** Orange-forward bloom (used by scan result screens). */
  accent?: boolean;
}

/**
 * Soft multi-layer mesh gradient background (green + orange blooms).
 * Rendered with react-native-svg radial gradients — fills its parent.
 * Gradient ids are unique per instance to avoid react-native-svg id collisions.
 */
export function MeshBg({ style, accent = false }: MeshBgProps) {
  const palette = usePalette();
  const uid = useId().replace(/:/g, '');
  const g1 = `${uid}-g1`;
  const g2 = `${uid}-g2`;
  const g3 = `${uid}-g3`;

  const primary = accent ? palette.orange : palette.green;
  const secondary = accent ? palette.green : palette.orange;

  return (
    <View style={[StyleSheet.absoluteFill, style]} pointerEvents="none">
      <Svg width="100%" height="100%">
        <Defs>
          <RadialGradient id={g1} cx={accent ? '80%' : '20%'} cy="10%" r="55%">
            <Stop offset="0" stopColor={primary} stopOpacity={accent ? 0.24 : 0.22} />
            <Stop offset="1" stopColor={primary} stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id={g2} cx={accent ? '12%' : '88%'} cy="28%" r="50%">
            <Stop offset="0" stopColor={secondary} stopOpacity={0.16} />
            <Stop offset="1" stopColor={secondary} stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id={g3} cx="50%" cy="100%" r="60%">
            <Stop offset="0" stopColor={palette.greenLight} stopOpacity={accent ? 0.12 : 0.16} />
            <Stop offset="1" stopColor={palette.greenLight} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill={palette.bg} />
        <Ellipse cx={accent ? '80%' : '20%'} cy="10%" rx="72%" ry="45%" fill={`url(#${g1})`} />
        <Ellipse cx={accent ? '12%' : '88%'} cy="28%" rx="60%" ry="45%" fill={`url(#${g2})`} />
        <Ellipse cx="50%" cy="100%" rx="80%" ry="50%" fill={`url(#${g3})`} />
      </Svg>
    </View>
  );
}
