import React from 'react';
import { Pressable, View } from 'react-native';

import { Icon, type IconName } from '@/design/Icon';
import { shadows } from '@/design/tokens';
import { usePalette } from '@/design/useScheme';

import { Txt } from './Txt';

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
  icon?: IconName;
}

interface SegmentedProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Per-value accent color for the active segment (e.g. lost → orange). */
  accentMap?: Partial<Record<T, string>>;
}

/** Segmented control matching the prototype (surface-3 track, elevated thumb). */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  accentMap,
}: SegmentedProps<T>) {
  const palette = usePalette();
  return (
    <View
      style={{
        flexDirection: 'row',
        padding: 4,
        backgroundColor: palette.surface3,
        borderRadius: 14,
      }}
    >
      {options.map((o) => {
        const active = o.value === value;
        const accent = accentMap?.[o.value];
        const bg = active ? accent ?? palette.surface : 'transparent';
        const fg = active ? (accent ? '#FFFFFF' : palette.text) : palette.text2;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            style={[
              {
                flex: 1,
                height: 42,
                borderRadius: 11,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 7,
                backgroundColor: bg,
              },
              active ? shadows.sm : null,
            ]}
          >
            {o.icon ? <Icon name={o.icon} size={17} color={fg} strokeWidth={2.2} /> : null}
            <Txt weight="semibold" style={{ fontSize: 14.5, color: fg }}>
              {o.label}
            </Txt>
          </Pressable>
        );
      })}
    </View>
  );
}
