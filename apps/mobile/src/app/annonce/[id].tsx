import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar, Btn, ObjectThumb, StatusBadge, Txt } from '@/components';
import { Icon, type IconName } from '@/design/Icon';
import { radius } from '@/design/tokens';
import { usePalette } from '@/design/useScheme';
import { annoncesKeys, fetchAnnonce } from '@/services/annonces.service';

/** Faithful port of the prototype's AnnonceDetail (rendered as a pushed screen). */
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

  const location = annonce ? (annonce.commune ?? annonce.city) : '';

  return (
    <View style={{ flex: 1, backgroundColor: palette.bg }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 8,
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          onPress={() => router.back()}
          style={{
            width: 44,
            height: 44,
            borderRadius: 44 / 2.6,
            backgroundColor: palette.surface3,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 14,
          }}
        >
          <Icon name="chevL" size={22} color={palette.text} />
        </Pressable>

        {!annonce ? (
          <Txt weight="medium" style={{ color: palette.text3 }}>
            Chargement…
          </Txt>
        ) : (
          <>
            <ObjectThumb
              tone={annonce.tone}
              radius={18}
              iconSize={48}
              showLabel
              style={{ height: 200, width: '100%' }}
            />

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 16 }}>
              <StatusBadge status={annonce.status} />
              <Txt weight="medium" style={{ fontSize: 13, color: palette.text3 }}>
                {annonce.category}
              </Txt>
              <Txt weight="regular" style={{ fontSize: 13, color: palette.text3, marginLeft: 'auto' }}>
                {annonce.timeLabel}
              </Txt>
            </View>

            <Txt weight="bold" style={{ fontSize: 23, lineHeight: 28, color: palette.text, marginTop: 12 }}>
              {annonce.title}
            </Txt>

            {/* Info cards */}
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
              <InfoCard icon="pin" label="Lieu" value={location} />
              <InfoCard icon="calendar" label="Date" value={annonce.dateLabel} />
            </View>

            <Txt
              weight="regular"
              style={{ fontSize: 15, lineHeight: 24, color: palette.text2, marginTop: 18 }}
            >
              {annonce.description}
            </Txt>

            {/* Author */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                marginTop: 18,
                padding: 14,
                borderRadius: radius.lg,
                backgroundColor: palette.surface2,
              }}
            >
              <Avatar name={annonce.author} size={42} accent={annonce.status === 'lost'} />
              <View style={{ flex: 1 }}>
                <Txt weight="semibold" style={{ fontSize: 15, color: palette.text }}>
                  {annonce.author}
                </Txt>
                <Txt weight="regular" style={{ fontSize: 12.5, color: palette.text3 }}>
                  Publié {annonce.timeLabel}
                </Txt>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Icon name="shield" size={15} color={palette.green} />
                <Txt weight="semibold" style={{ fontSize: 12.5, color: palette.green }}>
                  Vérifié
                </Txt>
              </View>
            </View>

            {/* Actions */}
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 18 }}>
              <Btn variant="ghost" size="lg" icon="whatsapp" />
              <View style={{ flex: 1 }}>
                <Btn variant="primary" size="lg" fullWidth icon="phone" label="Contacter" />
              </View>
            </View>

            <Pressable
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 7,
                paddingVertical: 12,
                marginTop: 12,
              }}
            >
              <Icon name="flag" size={16} color={palette.text3} />
              <Txt weight="semibold" style={{ fontSize: 13.5, color: palette.text3 }}>
                Signaler cette annonce
              </Txt>
            </Pressable>
          </>
        )}
      </ScrollView>
    </View>
  );
}

function InfoCard({ icon, label, value }: { icon: IconName; label: string; value: string }) {
  const palette = usePalette();
  return (
    <View
      style={{
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 9,
        padding: 12,
        borderRadius: 14,
        backgroundColor: palette.surface2,
      }}
    >
      <Icon name={icon} size={18} color={palette.green} />
      <View style={{ flex: 1 }}>
        <Txt weight="regular" style={{ fontSize: 11.5, color: palette.text3 }}>
          {label}
        </Txt>
        <Txt weight="semibold" style={{ fontSize: 14, color: palette.text }} numberOfLines={1}>
          {value}
        </Txt>
      </View>
    </View>
  );
}
