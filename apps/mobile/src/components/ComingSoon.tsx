import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, type IconName } from '@/design/Icon';
import { radius } from '@/design/tokens';
import { usePalette } from '@/design/useScheme';

import { Txt } from './Txt';

/** Phase-1 placeholder screen for features not yet implemented. */
export function ComingSoon({
  icon,
  title,
  subtitle,
}: {
  icon: IconName;
  title: string;
  subtitle: string;
}) {
  const palette = usePalette();
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: palette.bg,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: insets.top,
        paddingHorizontal: 32,
        gap: 14,
      }}
    >
      <View
        style={{
          width: 72,
          height: 72,
          borderRadius: radius.xl,
          backgroundColor: palette.greenSoft,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon name={icon} size={34} color={palette.green} />
      </View>
      <Txt weight="bold" style={{ fontSize: 20, color: palette.text, textAlign: 'center' }}>
        {title}
      </Txt>
      <Txt weight="medium" style={{ fontSize: 14, color: palette.text3, textAlign: 'center' }}>
        {subtitle}
      </Txt>
    </View>
  );
}
