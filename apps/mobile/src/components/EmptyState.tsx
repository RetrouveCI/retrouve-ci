import React from 'react';
import { View } from 'react-native';

import { Icon, type IconName } from '@/design/Icon';
import { usePalette } from '@/design/useScheme';

import { Txt } from './Txt';

interface EmptyStateProps {
  icon?: IconName;
  title: string;
  text: string;
  action?: React.ReactNode;
}

/** Centered empty/zero-result state with a dashed icon halo. */
export function EmptyState({ icon = 'search', title, text, action }: EmptyStateProps) {
  const palette = usePalette();
  return (
    <View style={{ alignItems: 'center', paddingVertical: 48, paddingHorizontal: 30 }}>
      <View
        style={{
          width: 92,
          height: 92,
          borderRadius: 28,
          backgroundColor: palette.greenSoft,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 20,
        }}
      >
        <View
          style={{
            position: 'absolute',
            top: -8,
            left: -8,
            right: -8,
            bottom: -8,
            borderRadius: 34,
            borderWidth: 1.5,
            borderColor: palette.border2,
            borderStyle: 'dashed',
          }}
        />
        <Icon name={icon} size={38} color={palette.green} strokeWidth={1.8} />
      </View>
      <Txt weight="bold" style={{ fontSize: 18, color: palette.text, marginBottom: 8 }}>
        {title}
      </Txt>
      <Txt
        weight="regular"
        style={{ fontSize: 14.5, color: palette.text2, lineHeight: 21, textAlign: 'center', maxWidth: 260 }}
      >
        {text}
      </Txt>
      {action ? <View style={{ marginTop: 22 }}>{action}</View> : null}
    </View>
  );
}
