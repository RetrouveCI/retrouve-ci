import React, { useRef } from 'react';
import { TextInput, View, type NativeSyntheticEvent, type TextInputKeyPressEventData } from 'react-native';

import { fontFamily } from '@/design/fonts';
import { usePalette } from '@/design/useScheme';

interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
}

/** Boxed one-time-code input with auto-advance and backspace-to-previous. */
export function OtpInput({ length = 4, value, onChange }: OtpInputProps) {
  const palette = usePalette();
  const refs = useRef<(TextInput | null)[]>([]);

  const handle = (i: number, raw: string) => {
    const digit = raw.replace(/\D/g, '').slice(-1);
    const arr = value.split('');
    arr[i] = digit;
    const next = arr.join('').slice(0, length);
    onChange(next);
    if (digit && i < length - 1) refs.current[i + 1]?.focus();
  };

  const onKey = (i: number, e: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
    if (e.nativeEvent.key === 'Backspace' && !value[i] && i > 0) refs.current[i - 1]?.focus();
  };

  return (
    <View style={{ flexDirection: 'row', gap: 12, justifyContent: 'center' }}>
      {Array.from({ length }).map((_, i) => {
        const filled = Boolean(value[i]);
        return (
          <TextInput
            key={i}
            ref={(el) => {
              refs.current[i] = el;
            }}
            value={value[i] ?? ''}
            onChangeText={(v) => handle(i, v)}
            onKeyPress={(e) => onKey(i, e)}
            keyboardType="number-pad"
            maxLength={1}
            autoFocus={i === 0}
            style={{
              width: 62,
              height: 70,
              textAlign: 'center',
              fontSize: 28,
              fontFamily: fontFamily.bold,
              color: palette.text,
              borderRadius: 18,
              backgroundColor: palette.surface,
              borderWidth: 1.5,
              borderColor: filled ? palette.green : palette.border2,
            }}
          />
        );
      })}
    </View>
  );
}
