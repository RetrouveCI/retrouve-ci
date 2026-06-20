import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, type IconName } from '@/design/Icon';
import { radius, shadows } from '@/design/tokens';
import { usePalette } from '@/design/useScheme';
import { useAppStore } from '@/store/app.store';

import { Txt } from './Txt';

const AUTO_DISMISS_MS = 2600;

/**
 * Global toast host. Reads the single toast from the store, animates it in from
 * the top and auto-dismisses. Mount once near the root layout.
 */
export function ToastHost() {
  const toast = useAppStore((s) => s.toast);
  const clearToast = useAppStore((s) => s.clearToast);
  const palette = usePalette();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(clearToast, AUTO_DISMISS_MS);
    return () => clearTimeout(id);
  }, [toast, clearToast]);

  if (!toast) return null;

  return (
    <Animated.View
      entering={FadeInDown.springify().damping(18)}
      exiting={FadeOutUp}
      pointerEvents="none"
      style={[
        styles.container,
        shadows.lg,
        {
          top: insets.top + 8,
          backgroundColor: palette.surface,
          borderColor: palette.border,
        },
      ]}
    >
      <Icon name={(toast.icon as IconName) ?? 'checkCircle'} size={20} color={palette.green} />
      <Txt weight="medium" style={{ color: palette.text, flexShrink: 1 }}>
        {toast.message}
      </Txt>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 100,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
});
