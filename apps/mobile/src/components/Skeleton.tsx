import React, { useEffect } from 'react';
import type { DimensionValue } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { useScheme } from '@/design/useScheme';

interface SkeletonProps {
  w?: DimensionValue;
  h?: number;
  r?: number;
  style?: object;
}

/** Pulsing placeholder block used while content loads. */
export function Skeleton({ w = '100%', h = 16, r = 8, style }: SkeletonProps) {
  const scheme = useScheme();
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(1, { duration: 700 }), -1, true);
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const base = scheme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(20,23,26,0.07)';

  return (
    <Animated.View
      style={[{ width: w, height: h, borderRadius: r, backgroundColor: base }, animatedStyle, style]}
    />
  );
}
