import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Btn, Card, StatusBadge, Txt } from '@/components';
import { Icon } from '@/design/Icon';
import { radius } from '@/design/tokens';
import { usePalette } from '@/design/useScheme';
import { timeAgo } from '@/lib/format';
import { fetchAnnonce, annoncesKeys } from '@/services/annonces.service';
import { useQuery } from '@tanstack/react-query';

/**
 * Annonce detail. Phase 1 renders the mock annonce inline; the full bottom-sheet
 * presentation + WhatsApp contact flow is refined alongside Listings (Phase 3).
 */
export default function AnnonceDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const palette = usePalette();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: annonce } = useQuery({
    queryKey: annoncesKeys.detail(id),
    queryFn: () => fetchAnnonce(id),
    enabled: Boolean(id),
  });

  return (
    <View style={{ flex: 1, backgroundColor: palette.bg }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 8,
          paddingHorizontal: 16,
          paddingBottom: insets.bottom + 24,
          gap: 16,
        }}
      >
        <Pressable
          onPress={() => router.back()}
          style={{
            width: 44,
            height: 44,
            borderRadius: radius.md,
            backgroundColor: palette.surface,
            borderWidth: 1,
            borderColor: palette.border,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name="chevL" size={24} color={palette.text} />
        </Pressable>

        {!annonce ? (
          <Txt weight="medium" style={{ color: palette.text3 }}>
            Chargement…
          </Txt>
        ) : (
          <>
            <View
              style={{
                height: 200,
                borderRadius: radius.lg,
                backgroundColor: palette.surface3,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name="image" size={44} color={palette.text3} />
            </View>
            <StatusBadge status={annonce.status} />
            <Txt weight="bold" style={{ fontSize: 22, color: palette.text }}>
              {annonce.title}
            </Txt>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Icon name="pin" size={16} color={palette.text3} />
              <Txt weight="medium" style={{ color: palette.text2 }}>
                {annonce.commune}, {annonce.city} · {timeAgo(annonce.createdAt)}
              </Txt>
            </View>
            <Card>
              <Txt weight="regular" style={{ color: palette.text2, lineHeight: 21 }}>
                {annonce.description}
              </Txt>
            </Card>
            <Btn
              label="Contacter via WhatsApp"
              icon="whatsapp"
              variant="primary"
              fullWidth
              onPress={() => router.back()}
            />
          </>
        )}
      </ScrollView>
    </View>
  );
}
