import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, Ellipse, RadialGradient, Rect, Stop } from 'react-native-svg';

import { usePalette } from '@/design/useScheme';

/**
 * Soft multi-layer mesh gradient background (green + orange blooms).
 * Rendered with react-native-svg radial gradients — fills its parent.
 */
export function MeshBg({ style }: { style?: object }) {
  const palette = usePalette();
  return (
    <View style={[StyleSheet.absoluteFill, style]} pointerEvents="none">
      <Svg width="100%" height="100%">
        <Defs>
          <RadialGradient id="g1" cx="20%" cy="12%" r="55%">
            <Stop offset="0" stopColor={palette.green} stopOpacity={0.22} />
            <Stop offset="1" stopColor={palette.green} stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="g2" cx="88%" cy="30%" r="50%">
            <Stop offset="0" stopColor={palette.orange} stopOpacity={0.18} />
            <Stop offset="1" stopColor={palette.orange} stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="g3" cx="50%" cy="100%" r="60%">
            <Stop offset="0" stopColor={palette.greenLight} stopOpacity={0.16} />
            <Stop offset="1" stopColor={palette.greenLight} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill={palette.bg} />
        <Ellipse cx="20%" cy="12%" rx="70%" ry="45%" fill="url(#g1)" />
        <Ellipse cx="88%" cy="30%" rx="60%" ry="45%" fill="url(#g2)" />
        <Ellipse cx="50%" cy="100%" rx="80%" ry="50%" fill="url(#g3)" />
      </Svg>
    </View>
  );
}
