import React from 'react';
import { ActivityIndicator, Pressable, View, type PressableProps } from 'react-native';

import { Icon, type IconName } from '@/design/Icon';
import { radius, shadows } from '@/design/tokens';
import { usePalette } from '@/design/useScheme';

import { Txt } from './Txt';

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline';
type Size = 'sm' | 'md' | 'lg';

interface BtnProps extends Omit<PressableProps, 'children' | 'style'> {
  label: string;
  variant?: Variant;
  size?: Size;
  icon?: IconName;
  iconRight?: IconName;
  loading?: boolean;
  fullWidth?: boolean;
}

const SIZES: Record<Size, { h: number; px: number; font: number; icon: number }> = {
  sm: { h: 40, px: 14, font: 13, icon: 18 },
  md: { h: 50, px: 18, font: 15, icon: 20 },
  lg: { h: 58, px: 22, font: 16, icon: 22 },
};

/** Primary action button — brand green, with orange/secondary/ghost variants. */
export function Btn({
  label,
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  loading,
  fullWidth,
  disabled,
  ...rest
}: BtnProps) {
  const palette = usePalette();
  const s = SIZES[size];
  const fg = (() => {
    switch (variant) {
      case 'secondary':
        return '#FFFFFF';
      case 'ghost':
        return palette.green;
      case 'outline':
        return palette.text;
      default:
        return '#FFFFFF';
    }
  })();

  const styleFor = (pressed: boolean) => {
    const dim = pressed ? 0.92 : 1;
    switch (variant) {
      case 'secondary':
        return { bg: palette.orange, fg: '#FFFFFF', border: 'transparent', opacity: dim };
      case 'ghost':
        return { bg: palette.greenSoft, fg: palette.green, border: 'transparent', opacity: dim };
      case 'outline':
        return { bg: 'transparent', fg: palette.text, border: palette.border2, opacity: dim };
      default:
        return { bg: palette.green, fg: '#FFFFFF', border: 'transparent', opacity: dim };
    }
  };

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      style={({ pressed }) => {
        const v = styleFor(pressed);
        return [
          {
            height: s.h,
            paddingHorizontal: s.px,
            borderRadius: radius.lg,
            backgroundColor: v.bg,
            borderWidth: variant === 'outline' ? 1.5 : 0,
            borderColor: v.border,
            opacity: disabled ? 0.5 : v.opacity,
            flexDirection: 'row' as const,
            alignItems: 'center' as const,
            justifyContent: 'center' as const,
            gap: 8,
            alignSelf: fullWidth ? ('stretch' as const) : ('flex-start' as const),
          },
          variant === 'primary' || variant === 'secondary' ? shadows.sm : null,
        ];
      }}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {icon ? <Icon name={icon} size={s.icon} color={fg} /> : null}
          <Txt weight="semibold" style={{ color: fg, fontSize: s.font }}>
            {label}
          </Txt>
          {iconRight ? <Icon name={iconRight} size={s.icon} color={fg} /> : null}
        </View>
      )}
    </Pressable>
  );
}
