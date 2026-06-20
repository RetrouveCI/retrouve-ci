import React from 'react';
import { View } from 'react-native';

import { radius } from '@/design/tokens';
import { usePalette } from '@/design/useScheme';

import { Txt } from './Txt';

export type ItemStatus = 'lost' | 'found' | 'resolved';

const LABELS: Record<ItemStatus, string> = {
  lost: 'Perdu',
  found: 'Retrouvé',
  resolved: 'Résolu',
};

/** Pill badge reflecting a listing status (perdu / retrouvé / résolu). */
export function StatusBadge({ status }: { status: ItemStatus }) {
  const palette = usePalette();
  const tone =
    status === 'found' || status === 'resolved'
      ? { bg: palette.greenSoft, fg: palette.green }
      : { bg: palette.orangeSoft, fg: palette.orange };

  return (
    <View
      style={{
        backgroundColor: tone.bg,
        borderRadius: radius.full,
        paddingHorizontal: 10,
        paddingVertical: 4,
        alignSelf: 'flex-start',
      }}
    >
      <Txt weight="semibold" style={{ color: tone.fg, fontSize: 11 }}>
        {LABELS[status]}
      </Txt>
    </View>
  );
}
