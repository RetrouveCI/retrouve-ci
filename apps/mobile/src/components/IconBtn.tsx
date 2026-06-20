import { BlurView } from 'expo-blur';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Icon, type IconName } from '@/design/Icon';
import { usePalette, useScheme } from '@/design/useScheme';

type IconBtnVariant = 'ghost' | 'glass' | 'plain' | 'green';

interface IconBtnProps {
  name: IconName;
  onPress?: () => void;
  variant?: IconBtnVariant;
  size?: number;
  iconSize?: number;
  /** Show the small orange notification dot. */
  badge?: boolean;
  accessibilityLabel?: string;
}

/** Square-ish icon button matching the prototype's IconBtn (radius = size/2.6). */
export function IconBtn({
  name,
  onPress,
  variant = 'ghost',
  size = 44,
  iconSize = 21,
  badge,
  accessibilityLabel,
}: IconBtnProps) {
  const palette = usePalette();
  const scheme = useScheme();
  const radius = size / 2.6;

  const fills: Record<IconBtnVariant, { bg: string; fg: string; border?: string }> = {
    ghost: { bg: palette.surface3, fg: palette.text },
    glass: { bg: palette.glass, fg: palette.text, border: palette.glassBorder },
    plain: { bg: 'transparent', fg: palette.text },
    green: { bg: palette.greenSoft, fg: palette.green },
  };
  const v = fills[variant];

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => ({
        width: size,
        height: size,
        borderRadius: radius,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: variant === 'glass' ? undefined : v.bg,
        borderWidth: v.border ? 1 : 0,
        borderColor: v.border,
        opacity: pressed ? 0.85 : 1,
      })}
    >
      {variant === 'glass' ? (
        <BlurView
          intensity={40}
          tint={scheme === 'dark' ? 'dark' : 'light'}
          style={[StyleSheet.absoluteFill, { backgroundColor: v.bg }]}
        />
      ) : null}
      <Icon name={name} size={iconSize} color={v.fg} strokeWidth={2.1} />
      {badge ? (
        <View
          style={{
            position: 'absolute',
            top: 8,
            right: 9,
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: palette.orange,
            borderWidth: 1.5,
            borderColor: palette.surface,
          }}
        />
      ) : null}
    </Pressable>
  );
}
