import { useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import { Card, StatusBadge, Txt } from '@/components';
import { Icon } from '@/design/Icon';
import { radius } from '@/design/tokens';
import { usePalette } from '@/design/useScheme';
import { timeAgo } from '@/lib/format';
import type { Annonce } from '@/services/types';

/** Horizontal annonce card used in the Home "annonces récentes" carousel. */
export function AnnonceCardH({ annonce }: { annonce: Annonce }) {
  const palette = usePalette();
  const router = useRouter();

  return (
    <Card
      padding={0}
      onPress={() => router.push(`/annonce/${annonce.id}`)}
      style={{ width: 220, overflow: 'hidden' }}
    >
      <View
        style={{
          height: 110,
          backgroundColor: palette.surface3,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon name="image" size={32} color={palette.text3} />
        <View style={{ position: 'absolute', top: 10, left: 10 }}>
          <StatusBadge status={annonce.status} />
        </View>
      </View>
      <View style={{ padding: 12, gap: 6 }}>
        <Txt weight="semibold" numberOfLines={1} style={{ fontSize: 14, color: palette.text }}>
          {annonce.title}
        </Txt>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Icon name="pin" size={13} color={palette.text3} />
          <Txt
            weight="medium"
            numberOfLines={1}
            style={{ fontSize: 12, color: palette.text3, flexShrink: 1 }}
          >
            {annonce.commune}, {annonce.city}
          </Txt>
        </View>
        <Txt weight="regular" style={{ fontSize: 11, color: palette.text3 }}>
          {timeAgo(annonce.createdAt)}
        </Txt>
      </View>
    </Card>
  );
}

export const CARD_GAP = radius.md;
