import React, { useState } from 'react';
import { Pressable, TextInput, View, type KeyboardTypeOptions } from 'react-native';

import { Icon, type IconName } from '@/design/Icon';
import { fontFamily } from '@/design/fonts';
import { radius } from '@/design/tokens';
import { usePalette } from '@/design/useScheme';

import { Txt } from './Txt';

interface FieldProps {
  label?: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  icon?: IconName;
  prefix?: string;
  /** Trailing icon button (e.g. eye toggle). */
  right?: IconName;
  onRightPress?: () => void;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  maxLength?: number;
  autoFocus?: boolean;
}

/** Text field with a focus ring, leading icon/prefix and optional trailing action. */
export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  icon,
  prefix,
  right,
  onRightPress,
  secureTextEntry,
  keyboardType,
  maxLength,
  autoFocus,
}: FieldProps) {
  const palette = usePalette();
  const [focus, setFocus] = useState(false);

  return (
    <View>
      {label ? (
        <Txt weight="semibold" style={{ fontSize: 13.5, color: palette.text2, marginBottom: 8 }}>
          {label}
        </Txt>
      ) : null}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          height: 54,
          paddingHorizontal: 16,
          borderRadius: radius.lg,
          backgroundColor: palette.surface,
          borderWidth: 1.5,
          borderColor: focus ? palette.green : palette.border2,
        }}
      >
        {icon ? <Icon name={icon} size={19} color={palette.text3} /> : null}
        {prefix ? (
          <Txt weight="semibold" style={{ fontSize: 16, color: palette.text2 }}>
            {prefix}
          </Txt>
        ) : null}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={palette.text3}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          maxLength={maxLength}
          autoFocus={autoFocus}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          style={{
            flex: 1,
            fontFamily: fontFamily.medium,
            fontSize: 16,
            color: palette.text,
            padding: 0,
          }}
        />
        {right ? (
          <Pressable onPress={onRightPress} hitSlop={8} style={{ padding: 4 }}>
            <Icon name={right} size={19} color={palette.text3} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
