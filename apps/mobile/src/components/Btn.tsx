import React from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';

import { Icon, type IconName } from '@/design/Icon';
import { radius, shadows } from '@/design/tokens';
import { usePalette } from '@/design/useScheme';

import { Txt } from './Txt';

type Variant =
  | 'primary'
  | 'accent'
  | 'dark'
  | 'outline'
  | 'ghost'
  | 'soft'
  | 'softAccent'
  | 'glass';
type Size = 'sm' | 'md' | 'lg';

interface BtnProps {
  label?: string;
  variant?: Variant;
  size?: Size;
  icon?: IconName;
  iconRight?: IconName;
  loading?: boolean;
  fullWidth?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  style?: object;
}

const SIZES: Record<Size, { h: number; px: number; font: number; icon: number }> = {
  lg: { h: 56, px: 22, font: 17, icon: 20 },
  md: { h: 48, px: 18, font: 15.5, icon: 20 },
  sm: { h: 38, px: 14, font: 14, icon: 17 },
};

/** Primary action button — faithful to the prototype's `Btn` variant set. */
export function Btn({
  label,
  variant = 'primary',
  size = 'lg',
  icon,
  iconRight,
  loading,
  fullWidth,
  disabled,
  onPress,
  style,
}: BtnProps) {
  const palette = usePalette();
  const s = SIZES[size];

  const variants: Record<Variant, { bg: string; fg: string; border?: string; shadow?: object }> = {
    primary: { bg: palette.green, fg: '#FFFFFF', shadow: shadows.sm },
    accent: { bg: palette.orange, fg: '#FFFFFF', shadow: shadows.sm },
    dark: { bg: palette.greenDark, fg: '#FFFFFF' },
    outline: { bg: 'transparent', fg: palette.text, border: palette.border2 },
    ghost: { bg: palette.surface3, fg: palette.text },
    soft: { bg: palette.greenSoft, fg: palette.green },
    softAccent: { bg: palette.orangeSoft, fg: palette.orangeDark },
    glass: { bg: palette.glass, fg: palette.text, border: palette.glassBorder },
  };
  const v = variants[variant];
  const iconOnly = !label;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        {
          height: s.h,
          paddingHorizontal: iconOnly ? 0 : s.px,
          width: iconOnly ? s.h : undefined,
          borderRadius: radius.lg,
          backgroundColor: v.bg,
          borderWidth: v.border ? 1.5 : 0,
          borderColor: v.border,
          opacity: disabled ? 0.45 : pressed ? 0.92 : 1,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 9,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
        },
        v.shadow,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.fg} />
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}>
          {icon ? <Icon name={icon} size={s.icon} color={v.fg} strokeWidth={2.2} /> : null}
          {label ? (
            <Txt weight="semibold" style={{ color: v.fg, fontSize: s.font }}>
              {label}
            </Txt>
          ) : null}
          {iconRight ? <Icon name={iconRight} size={s.icon} color={v.fg} strokeWidth={2.2} /> : null}
        </View>
      )}
    </Pressable>
  );
}
