import React from 'react';
import { Pressable, View } from 'react-native';

import { Txt } from '@/components';
import { Icon } from '@/design/Icon';
import { usePalette } from '@/design/useScheme';

/** Removable active-filter chip shown under the Listings search bar. */
export function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  const palette = usePalette();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        height: 32,
        paddingLeft: 12,
        paddingRight: 6,
        borderRadius: 999,
        backgroundColor: palette.greenSoft,
      }}
    >
      <Txt weight="semibold" style={{ fontSize: 13, color: palette.green }}>
        {label}
      </Txt>
      <Pressable onPress={onRemove} hitSlop={6} style={{ padding: 2 }}>
        <Icon name="close" size={14} color={palette.green} strokeWidth={2.4} />
      </Pressable>
    </View>
  );
}
