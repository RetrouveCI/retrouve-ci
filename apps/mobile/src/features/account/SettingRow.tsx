import React, { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Txt } from '@/components';
import { Icon, type IconName } from '@/design/Icon';
import { usePalette } from '@/design/useScheme';

/** A single settings row (icon + label + sub) with a trailing control or chevron. */
export function SettingRow({
  icon,
  label,
  sub,
  right,
  danger,
  onPress,
}: {
  icon: IconName;
  label: string;
  sub?: string;
  right?: React.ReactNode;
  danger?: boolean;
  onPress?: () => void;
}) {
  const palette = usePalette();
  const fg = danger ? palette.orangeDark : palette.green;
  const soft = danger ? palette.orangeSoft : palette.greenSoft;
  const Wrapper: React.ComponentType<{ onPress?: () => void; children: React.ReactNode }> =
    onPress ? PressableRow : StaticRow;

  return (
    <Wrapper onPress={onPress}>
      <View
        style={{
          width: 38,
          height: 38,
          borderRadius: 11,
          backgroundColor: soft,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon name={icon} size={19} color={fg} />
      </View>
      <View style={{ flex: 1 }}>
        <Txt weight="semibold" style={{ fontSize: 15, color: danger ? palette.orangeDark : palette.text }}>
          {label}
        </Txt>
        {sub ? (
          <Txt weight="regular" style={{ fontSize: 12.5, color: palette.text3, marginTop: 1 }}>
            {sub}
          </Txt>
        ) : null}
      </View>
      {right ?? <Icon name="chevR" size={18} color={palette.text3} strokeWidth={2.2} />}
    </Wrapper>
  );
}

function PressableRow({ onPress, children }: { onPress?: () => void; children: React.ReactNode }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 13,
        padding: 14,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      {children}
    </Pressable>
  );
}

function StaticRow({ children }: { children: React.ReactNode }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 13, padding: 14 }}>{children}</View>
  );
}

/** Animated on/off switch. */
export function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  const palette = usePalette();
  const x = useSharedValue(on ? 21 : 3);

  useEffect(() => {
    x.value = withTiming(on ? 21 : 3, { duration: 180 });
  }, [on, x]);

  const knobStyle = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));

  return (
    <Pressable
      onPress={onToggle}
      style={{
        width: 46,
        height: 28,
        borderRadius: 14,
        backgroundColor: on ? palette.green : palette.border2,
        justifyContent: 'center',
      }}
    >
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: 3,
            left: 0,
            width: 22,
            height: 22,
            borderRadius: 11,
            backgroundColor: '#FFFFFF',
          },
          knobStyle,
        ]}
      />
    </Pressable>
  );
}
