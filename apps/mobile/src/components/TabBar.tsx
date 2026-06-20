import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import React from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, type IconName } from '@/design/Icon';
import { paletteFor, radius, shadows } from '@/design/tokens';
import { useScheme } from '@/design/useScheme';

import { Txt } from './Txt';

/**
 * Minimal structural type for the subset of the bottom-tab bar props we use.
 * Avoids a direct import of @react-navigation/bottom-tabs, which pnpm does not
 * hoist (it is a transitive dep of expo-router).
 */
export interface TabBarProps {
  state: {
    index: number;
    routes: { key: string; name: string }[];
  };
  navigation: {
    navigate: (name: string) => void;
    // Loosely typed to stay structurally compatible with react-navigation's
    // generic `emit` without importing it.
    emit: (event: { type: 'tabPress'; target?: string; canPreventDefault: true }) => {
      defaultPrevented: boolean;
    };
  };
}

type Item =
  | { kind: 'tab'; route: string; label: string; icon: IconName }
  | { kind: 'action'; label: string; icon: IconName };

const ITEMS: Item[] = [
  { kind: 'tab', route: 'accueil', label: 'Accueil', icon: 'home' },
  { kind: 'action', label: 'Scanner', icon: 'scan' },
  { kind: 'tab', route: 'annonces', label: 'Annonces', icon: 'list' },
  { kind: 'tab', route: 'compte', label: 'Compte', icon: 'user' },
];

/**
 * Floating glassmorphic tab bar. The "Scanner" item is NOT a real tab — it
 * pushes the fullscreen scan modal and uses the orange accent. Active tabs show
 * a soft pill behind the icon (skill §5).
 */
export function TabBar({ state, navigation }: TabBarProps) {
  const router = useRouter();
  const scheme = useScheme();
  const palette = paletteFor(scheme);
  const insets = useSafeAreaInsets();

  const activeRoute = state.routes[state.index]?.name;

  return (
    <View
      style={[styles.wrap, { bottom: Math.max(insets.bottom, 14) }, shadows.lg]}
      pointerEvents="box-none"
    >
      <BlurView
        intensity={Platform.OS === 'android' ? 40 : 60}
        tint={scheme === 'dark' ? 'dark' : 'light'}
        style={[styles.bar, { backgroundColor: palette.glass, borderColor: palette.glassBorder }]}
      >
        {ITEMS.map((item) => {
          const isScanner = item.kind === 'action';
          const active = item.kind === 'tab' && item.route === activeRoute;
          const accent = isScanner ? palette.orange : palette.green;
          const pillBg = isScanner ? palette.orangeSoft : palette.greenSoft;
          const iconColor = active || isScanner ? accent : palette.text3;

          const onPress = () => {
            if (isScanner) {
              router.push('/(modals)/scan');
              return;
            }
            const event = navigation.emit({
              type: 'tabPress',
              target:
                state.routes.find((r: { name: string; key: string }) => r.name === item.route)
                  ?.key ?? '',
              canPreventDefault: true,
            });
            if (!active && !event.defaultPrevented) navigation.navigate(item.route);
          };

          return (
            <Pressable
              key={item.label}
              onPress={onPress}
              style={styles.item}
              accessibilityRole="button"
              accessibilityLabel={item.label}
            >
              <View style={[styles.iconWrap, (active || isScanner) && { backgroundColor: pillBg }]}>
                <Icon name={item.icon} size={22} color={iconColor} strokeWidth={active ? 2.4 : 2} />
              </View>
              <Txt
                weight={active ? 'bold' : 'medium'}
                style={{ fontSize: 10.5, color: active || isScanner ? accent : palette.text3 }}
              >
                {item.label}
              </Txt>
            </Pressable>
          );
        })}
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 14,
    right: 14,
  },
  bar: {
    height: 66,
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    paddingHorizontal: 6,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  iconWrap: {
    width: 40,
    height: 30,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
