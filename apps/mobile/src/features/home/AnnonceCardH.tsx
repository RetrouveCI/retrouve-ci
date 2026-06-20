import { useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import { Card, ObjectThumb, StatusBadge, Txt } from '@/components';
import { Icon } from '@/design/Icon';
import { usePalette } from '@/design/useScheme';
import type { Annonce } from '@/services/types';

/** Horizontal annonce card used in the Home "Dernières annonces" carousel. */
export function AnnonceCardH({ annonce }: { annonce: Annonce }) {
  const palette = usePalette();
  const router = useRouter();

  return (
    <Card
      padding={0}
      onPress={() => router.push(`/annonce/${annonce.id}`)}
      style={{ width: 200, overflow: 'hidden' }}
    >
      <View>
        <ObjectThumb
          tone={annonce.tone}
          uri={annonce.image}
          radius={0}
          iconSize={30}
          showLabel
          style={{ width: '100%', height: 116 }}
        />
        <View style={{ position: 'absolute', top: 10, left: 10 }}>
          <StatusBadge status={annonce.status} size="sm" />
        </View>
      </View>
      <View style={{ padding: 13 }}>
        <Txt
          weight="semibold"
          numberOfLines={2}
          style={{ fontSize: 14.5, lineHeight: 18, minHeight: 36, color: palette.text }}
        >
          {annonce.title}
        </Txt>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 9 }}>
          <Icon name="pin" size={13} color={palette.text3} />
          <Txt weight="medium" style={{ fontSize: 12.5, color: palette.text3 }}>
            {annonce.commune ?? annonce.city}
          </Txt>
          <Txt weight="regular" style={{ fontSize: 12.5, color: palette.text3, marginLeft: 'auto' }}>
            {annonce.timeLabel}
          </Txt>
        </View>
      </View>
    </Card>
  );
}
