import { useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import { Card, ObjectThumb, StatusBadge, Txt } from '@/components';
import { Icon } from '@/design/Icon';
import { usePalette } from '@/design/useScheme';
import type { Annonce } from '@/services/types';

/** Full-width annonce row used in the Listings list. */
export function AnnonceRow({ annonce }: { annonce: Annonce }) {
  const palette = usePalette();
  const router = useRouter();
  const location = annonce.commune ? `${annonce.commune}, ${annonce.city}` : annonce.city;

  return (
    <Card padding={12} onPress={() => router.push(`/annonce/${annonce.id}`)}>
      <View style={{ flexDirection: 'row', gap: 13 }}>
        <ObjectThumb tone={annonce.tone} radius={14} iconSize={26} style={{ width: 78, height: 78 }} />
        <View style={{ flex: 1 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 8,
            }}
          >
            <StatusBadge status={annonce.status} size="sm" />
            <Txt weight="regular" style={{ fontSize: 12, color: palette.text3 }}>
              {annonce.timeLabel}
            </Txt>
          </View>
          <Txt
            weight="semibold"
            numberOfLines={2}
            style={{ fontSize: 15.5, lineHeight: 19, marginTop: 7, color: palette.text }}
          >
            {annonce.title}
          </Txt>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 8 }}>
            <Icon name="pin" size={14} color={palette.text3} />
            <Txt weight="medium" style={{ fontSize: 13, color: palette.text3 }}>
              {location}
            </Txt>
          </View>
        </View>
      </View>
    </Card>
  );
}
