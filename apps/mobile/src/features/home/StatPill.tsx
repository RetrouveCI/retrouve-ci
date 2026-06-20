import React from 'react';
import { View } from 'react-native';

import { Txt } from '@/components';
import { Icon, type IconName } from '@/design/Icon';
import { usePalette } from '@/design/useScheme';

interface StatPillProps {
  icon: IconName;
  value: string;
  label: string;
  accent?: boolean;
}

/** Compact stat (icon + value + label) used inside the Home stats strip. */
export function StatPill({ icon, value, label, accent }: StatPillProps) {
  const palette = usePalette();
  const soft = accent ? palette.orangeSoft : palette.greenSoft;
  const color = accent ? palette.orangeDark : palette.green;

  return (
    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <View
        style={{
          width: 38,
          height: 38,
          borderRadius: 12,
          backgroundColor: soft,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon name={icon} size={19} color={color} />
      </View>
      <View>
        <Txt weight="bold" style={{ fontSize: 17, color: palette.text }}>
          {value}
        </Txt>
        <Txt weight="regular" style={{ fontSize: 11.5, color: palette.text3, marginTop: 3 }}>
          {label}
        </Txt>
      </View>
    </View>
  );
}
