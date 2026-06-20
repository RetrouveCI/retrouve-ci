import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useRef } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar, Card, IconBtn, MeshBg, Txt, type SheetRef } from '@/components';
import { Icon, type IconName } from '@/design/Icon';
import { usePalette } from '@/design/useScheme';
import { formatNumber } from '@/lib/format';
import { useHomeStats, useRecentAnnonces } from '@/services/annonces.service';
import { useUnreadCount } from '@/services/notifications.service';
import { CURRENT_USER } from '@/services/types';
import { useAppStore } from '@/store/app.store';

import { AnnonceCardH } from './AnnonceCardH';
import { NotificationsSheet } from './NotificationsSheet';
import { StatPill } from './StatPill';

const HOW_IT_WORKS: { icon: IconName; title: string; body: string }[] = [
  {
    icon: 'tag',
    title: 'Commandez vos stickers',
    body: 'Recevez vos QR codes et collez-les sur vos objets.',
  },
  {
    icon: 'camera',
    title: 'On scanne, vous êtes prévenu',
    body: 'La personne qui trouve votre objet vous joint en un scan.',
  },
  {
    icon: 'checkCircle',
    title: 'Vous récupérez votre bien',
    body: 'Sans jamais exposer votre numéro de téléphone.',
  },
];

export function HomeScreen() {
  const palette = usePalette();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const notifRef = useRef<SheetRef>(null);

  const authed = useAppStore((s) => s.isAuthenticated);
  // Auth isn't wired yet; display the prototype user (matches the design).
  const user = CURRENT_USER;
  const { data: unread = 0 } = useUnreadCount();
  const { data: stats } = useHomeStats();
  const { data: recent = [] } = useRecentAnnonces();

  return (
    <View style={{ flex: 1, backgroundColor: palette.bg }}>
      <MeshBg />
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View
          style={{
            paddingHorizontal: 20,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <View>
            <Txt weight="medium" style={{ fontSize: 13.5, color: palette.text2 }}>
              {authed ? 'Bonjour 👋' : 'Bienvenue sur'}
            </Txt>
            <Txt weight="bold" style={{ fontSize: 23, color: palette.text, marginTop: 1 }}>
              {authed ? user.name.split(' ')[0] : 'RetrouveCI'}
            </Txt>
          </View>
          {authed ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <IconBtn
                name="bell"
                variant="glass"
                badge={unread > 0}
                onPress={() => notifRef.current?.present()}
                accessibilityLabel="Notifications"
              />
              <Pressable onPress={() => router.push('/compte')} accessibilityLabel="Mon compte">
                <Avatar name={user.name} size={46} />
              </Pressable>
            </View>
          ) : null}
        </View>

        {/* Search */}
        <View style={{ paddingHorizontal: 20, paddingTop: 18 }}>
          <Pressable
            onPress={() => router.push({ pathname: '/annonces', params: { focus: '1' } })}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 11,
              height: 52,
              paddingHorizontal: 16,
              borderRadius: 16,
              backgroundColor: palette.surface,
              borderWidth: 1,
              borderColor: palette.border,
            }}
          >
            <Icon name="search" size={20} color={palette.text3} />
            <Txt weight="regular" style={{ fontSize: 15.5, color: palette.text3 }}>
              Rechercher un objet, une ville…
            </Txt>
          </Pressable>
        </View>

        {/* Primary CTA — Scanner un sticker (gradient) */}
        <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
          <Pressable
            onPress={() => router.push('/(modals)/scan')}
            style={{ borderRadius: 22, overflow: 'hidden' }}
          >
            <LinearGradient
              colors={[palette.orangeLight, palette.orange, palette.orangeDark] as const}
              locations={[0, 0.55, 1] as const}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ padding: 20 }}
            >
              <View style={{ position: 'absolute', top: -30, right: -20, opacity: 0.18 }}>
                <Icon name="qr" size={150} color="#FFFFFF" strokeWidth={1.2} />
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
                <View
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 18,
                    backgroundColor: 'rgba(255,255,255,0.22)',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon name="camera" size={29} color="#FFFFFF" strokeWidth={2.1} />
                </View>
                <View style={{ flex: 1 }}>
                  <Txt weight="bold" style={{ fontSize: 19, color: '#FFFFFF' }}>
                    Scanner un sticker
                  </Txt>
                  <Txt
                    weight="regular"
                    style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.92)', marginTop: 2 }}
                  >
                    Objet perdu ou retrouvé ? Scannez le QR.
                  </Txt>
                </View>
                <Icon name="arrowR" size={22} color="#FFFFFF" strokeWidth={2.4} />
              </View>
            </LinearGradient>
          </Pressable>

          {!authed ? (
            <Card onPress={() => router.push('/(modals)/scan')} style={{ marginTop: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 15,
                    backgroundColor: palette.greenSoft,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon name="user" size={24} color={palette.green} />
                </View>
                <View style={{ flex: 1 }}>
                  <Txt weight="bold" style={{ fontSize: 16, color: palette.text }}>
                    Se connecter
                  </Txt>
                  <Txt weight="regular" style={{ fontSize: 13, color: palette.text2, marginTop: 2 }}>
                    Publiez et gérez vos annonces
                  </Txt>
                </View>
                <Icon name="chevR" size={20} color={palette.text3} />
              </View>
            </Card>
          ) : null}
        </View>

        {/* Stats strip */}
        <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
          <Card padding={15}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <StatPill
                icon="checkCircle"
                value={formatNumber(stats?.itemsReturned ?? 0)}
                label="Objets rendus"
              />
              <View style={{ width: 1, height: 34, backgroundColor: palette.border }} />
              <StatPill
                icon="qr"
                value={formatNumber(stats?.activeStickers ?? 0)}
                label="Stickers actifs"
                accent
              />
            </View>
          </Card>
        </View>

        {/* Recent annonces */}
        <View style={{ paddingTop: 26 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 20,
              paddingBottom: 14,
            }}
          >
            <Txt weight="bold" style={{ fontSize: 18, color: palette.text }}>
              Dernières annonces
            </Txt>
            <Pressable
              onPress={() => router.push('/annonces')}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}
            >
              <Txt weight="semibold" style={{ fontSize: 14, color: palette.green }}>
                Tout voir
              </Txt>
              <Icon name="chevR" size={15} color={palette.green} strokeWidth={2.4} />
            </Pressable>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 13, paddingHorizontal: 20, paddingBottom: 4 }}
          >
            {recent.map((a) => (
              <AnnonceCardH key={a.id} annonce={a} />
            ))}
          </ScrollView>
        </View>

        {/* How it works */}
        <View style={{ paddingHorizontal: 20, paddingTop: 26 }}>
          <Txt weight="bold" style={{ fontSize: 18, color: palette.text, marginBottom: 14 }}>
            Comment ça marche
          </Txt>
          <View style={{ gap: 10 }}>
            {HOW_IT_WORKS.map((step, i) => (
              <Card key={step.title} padding={14}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                  <View
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 9,
                      backgroundColor: palette.green,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Txt weight="bold" style={{ fontSize: 13, color: '#FFFFFF' }}>
                      {i + 1}
                    </Txt>
                  </View>
                  <View
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 13,
                      backgroundColor: palette.greenSoft,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon name={step.icon} size={21} color={palette.green} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Txt weight="semibold" style={{ fontSize: 15, color: palette.text }}>
                      {step.title}
                    </Txt>
                    <Txt
                      weight="regular"
                      style={{ fontSize: 12.5, color: palette.text2, marginTop: 2, lineHeight: 17 }}
                    >
                      {step.body}
                    </Txt>
                  </View>
                </View>
              </Card>
            ))}
          </View>
        </View>
      </ScrollView>

      <NotificationsSheet ref={notifRef} />
    </View>
  );
}
