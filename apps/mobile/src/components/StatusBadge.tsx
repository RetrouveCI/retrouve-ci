import React from 'react';
import { View } from 'react-native';

import { usePalette } from '@/design/useScheme';
import type { AnnonceStatus } from '@/services/types';

import { Txt } from './Txt';

/** Resolve the label + brand color for a listing status. */
export function statusMeta(status: AnnonceStatus, palette: ReturnType<typeof usePalette>) {
  return status === 'lost'
    ? { label: 'Perdu', color: palette.orange, soft: palette.orangeSoft }
    : { label: 'Retrouvé', color: palette.green, soft: palette.greenSoft };
}

/** Pill badge with a leading dot, reflecting perdu / retrouvé. */
export function StatusBadge({
  status,
  size = 'md',
}: {
  status: AnnonceStatus;
  size?: 'sm' | 'md';
}) {
  const palette = usePalette();
  const m = statusMeta(status, palette);
  const sm = size === 'sm';
  const dot = sm ? 5 : 6;

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        alignSelf: 'flex-start',
        paddingHorizontal: sm ? 8 : 11,
        paddingVertical: sm ? 3 : 5,
        borderRadius: 999,
        backgroundColor: m.soft,
      }}
    >
      <View style={{ width: dot, height: dot, borderRadius: dot / 2, backgroundColor: m.color }} />
      <Txt weight="semibold" style={{ color: m.color, fontSize: sm ? 11 : 12.5 }}>
        {m.label}
      </Txt>
    </View>
  );
}
