import { useRouter } from 'expo-router';
import React, { useRef } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar, Card, Txt, type SheetRef } from '@/components';
import { Icon } from '@/design/Icon';
import { radius, shadows } from '@/design/tokens';
import { usePalette } from '@/design/useScheme';
import { useHomeStats, useRecentAnnonces } from '@/services/annonces.service';
import { useUnreadCount } from '@/services/notifications.service';
import { useAppStore } from '@/store/app.store';

import { AnnonceCardH } from './AnnonceCardH';
import { NotificationsSheet } from './NotificationsSheet';
import { StatPill } from './StatPill';

export function HomeScreen() {
  const palette = usePalette();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const notifRef = useRef<SheetRef>(null);

  const user = useAppStore((s) => s.user);
  const showToast = useAppStore((s) => s.showToast);
  const { data: unread = 0 } = useUnreadCount();
  const { data: stats } = useHomeStats();
  const { data: recent = [], isLoading } = useRecentAnnonces();

  const firstName = user?.fullName?.split(' ')[0];
  const greeting = firstName ? `Bonjour ${firstName} 👋` : 'Bienvenue sur RetrouveCI';

  const onDeclare = () => {
    if (user) showToast('Déclaration bientôt disponible', 'info');
    else router.push('/(modals)/scan');
  };

  return (
    <View style={{ flex: 1, backgroundColor: palette.bg }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingHorizontal: 16,
          paddingBottom: 120,
          gap: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Txt weight="medium" style={{ fontSize: 13, color: palette.text3 }}>
              RetrouveCI
            </Txt>
            <Txt weight="bold" style={{ fontSize: 22, color: palette.text }}>
              {greeting}
            </Txt>
          </View>

          <Pressable
            onPress={() => notifRef.current?.present()}
            accessibilityLabel="Notifications"
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
            <Icon name="bell" size={22} color={palette.text} />
            {unread > 0 ? (
              <View
                style={{
                  position: 'absolute',
                  top: 8,
                  right: 9,
                  minWidth: 16,
                  height: 16,
                  paddingHorizontal: 3,
                  borderRadius: 8,
                  backgroundColor: palette.orange,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Txt weight="bold" style={{ fontSize: 9, color: '#FFFFFF' }}>
                  {unread}
                </Txt>
              </View>
            ) : null}
          </Pressable>

          <Pressable onPress={() => router.push('/compte')} accessibilityLabel="Mon compte">
            <Avatar name={user?.fullName} uri={user?.avatarUrl} size={44} />
          </Pressable>
        </View>

        {/* Search bar (tappable -> Annonces) */}
        <Pressable
          onPress={() => router.push('/annonces')}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            height: 50,
            paddingHorizontal: 16,
            borderRadius: radius.lg,
            backgroundColor: palette.surface,
            borderWidth: 1,
            borderColor: palette.border,
          }}
        >
          <Icon name="search" size={20} color={palette.text3} />
          <Txt weight="medium" style={{ color: palette.text3 }}>
            Rechercher un objet perdu…
          </Txt>
        </Pressable>

        {/* Primary CTA — Scanner un sticker */}
        <Pressable
          onPress={() => router.push('/(modals)/scan')}
          style={[
            {
              borderRadius: radius.xl,
              backgroundColor: palette.orange,
              padding: 20,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 16,
            },
            shadows.md,
          ]}
        >
          <View
            style={{
              width: 54,
              height: 54,
              borderRadius: radius.lg,
              backgroundColor: 'rgba(255,255,255,0.22)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="scan" size={28} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1 }}>
            <Txt weight="bold" style={{ fontSize: 17, color: '#FFFFFF' }}>
              Scanner un sticker
            </Txt>
            <Txt weight="medium" style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)' }}>
              Retrouvez le propriétaire d&apos;un objet
            </Txt>
          </View>
          <Icon name="chevR" size={22} color="#FFFFFF" />
        </Pressable>

        {/* Secondary CTA — Déclarer un objet perdu */}
        <Card onPress={onDeclare} elevated>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <View
              style={{
                width: 54,
                height: 54,
                borderRadius: radius.lg,
                backgroundColor: palette.greenSoft,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name="pin" size={28} color={palette.green} />
            </View>
            <View style={{ flex: 1 }}>
              <Txt weight="bold" style={{ fontSize: 17, color: palette.text }}>
                Déclarer un objet perdu
              </Txt>
              <Txt weight="medium" style={{ fontSize: 13, color: palette.text3 }}>
                Publiez une annonce en 1 minute
              </Txt>
            </View>
            <Icon name="chevR" size={22} color={palette.text3} />
          </View>
        </Card>

        {/* Stats */}
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <StatPill
            icon="checkCircle"
            value={(stats?.itemsReturned ?? 0).toLocaleString('fr-FR')}
            label="Objets rendus"
            accent="green"
          />
          <StatPill
            icon="qr"
            value={(stats?.activeStickers ?? 0).toLocaleString('fr-FR')}
            label="Stickers actifs"
            accent="orange"
          />
        </View>

        {/* Recent annonces */}
        <View style={{ gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Txt weight="bold" style={{ fontSize: 17, color: palette.text, flex: 1 }}>
              Annonces récentes
            </Txt>
            <Pressable onPress={() => router.push('/annonces')}>
              <Txt weight="semibold" style={{ fontSize: 13, color: palette.green }}>
                Tout voir
              </Txt>
            </Pressable>
          </View>

          {isLoading ? (
            <Txt weight="medium" style={{ color: palette.text3 }}>
              Chargement…
            </Txt>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 12, paddingRight: 4 }}
            >
              {recent.map((a) => (
                <AnnonceCardH key={a.id} annonce={a} />
              ))}
            </ScrollView>
          )}
        </View>
      </ScrollView>

      <NotificationsSheet ref={notifRef} />
    </View>
  );
}
