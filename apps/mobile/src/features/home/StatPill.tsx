import React from 'react';
import { View } from 'react-native';

import { Txt } from '@/components';
import { Icon, type IconName } from '@/design/Icon';
import { radius } from '@/design/tokens';
import { usePalette } from '@/design/useScheme';

interface StatPillProps {
  icon: IconName;
  value: string;
  label: string;
  accent?: 'green' | 'orange';
}

/** Horizontal stat pill used on the Home header (objets rendus, stickers actifs). */
export function StatPill({ icon, value, label, accent = 'green' }: StatPillProps) {
  const palette = usePalette();
  const color = accent === 'orange' ? palette.orange : palette.green;
  const soft = accent === 'orange' ? palette.orangeSoft : palette.greenSoft;

  return (
    <View
      style={{
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: palette.surface,
        borderColor: palette.border,
        borderWidth: 1,
        borderRadius: radius.lg,
        paddingVertical: 12,
        paddingHorizontal: 14,
      }}
    >
      <View
        style={{
          width: 38,
          height: 38,
          borderRadius: radius.md,
          backgroundColor: soft,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon name={icon} size={20} color={color} />
      </View>
      <View style={{ flexShrink: 1 }}>
        <Txt weight="bold" style={{ fontSize: 16, color: palette.text }}>
          {value}
        </Txt>
        <Txt weight="medium" style={{ fontSize: 11, color: palette.text3 }}>
          {label}
        </Txt>
      </View>
    </View>
  );
}
