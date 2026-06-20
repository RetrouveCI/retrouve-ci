import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, type IconName } from '@/design/Icon';
import { shadows } from '@/design/tokens';
import { usePalette } from '@/design/useScheme';
import { useAppStore } from '@/store/app.store';

import { Txt } from './Txt';

const AUTO_DISMISS_MS = 2200;

/**
 * Global toast host — dark pill sitting above the floating tab bar, matching the
 * prototype. Reads the single toast from the store and auto-dismisses. Mount
 * once near the root layout.
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
      exiting={FadeOutDown}
      pointerEvents="none"
      style={[
        styles.container,
        shadows.lg,
        { bottom: Math.max(insets.bottom, 14) + 78, backgroundColor: palette.text },
      ]}
    >
      <Icon name={(toast.icon as IconName) ?? 'checkCircle'} size={20} color={palette.greenLight} />
      <Txt weight="medium" style={{ color: palette.bg, flexShrink: 1 }}>
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
    zIndex: 200,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 14,
  },
});
