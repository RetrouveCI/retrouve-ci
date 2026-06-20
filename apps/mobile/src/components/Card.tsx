import React from 'react';
import { Pressable, View, type ViewProps } from 'react-native';

import { radius, shadows } from '@/design/tokens';
import { usePalette } from '@/design/useScheme';

interface CardProps extends ViewProps {
  /** Apply a soft elevation shadow. */
  elevated?: boolean;
  /** Inner padding in px. Defaults to 16. */
  padding?: number;
  /** When set, the card becomes pressable. */
  onPress?: () => void;
}

/** Surface container with token border, radius and optional elevation. */
export function Card({ elevated, padding = 16, onPress, style, children, ...rest }: CardProps) {
  const palette = usePalette();
  const base = [
    {
      backgroundColor: palette.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: palette.border,
      padding,
    },
    elevated ? shadows.md : null,
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [...base, { opacity: pressed ? 0.95 : 1 }]}
        {...rest}
      >
        {children}
      </Pressable>
    );
  }
  return (
    <View style={base} {...rest}>
      {children}
    </View>
  );
}
