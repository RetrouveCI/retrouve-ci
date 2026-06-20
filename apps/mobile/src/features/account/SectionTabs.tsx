import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { Txt } from '@/components';
import { Icon, type IconName } from '@/design/Icon';
import { usePalette } from '@/design/useScheme';

export type AccountTab = 'annonces' | 'stickers' | 'commandes' | 'params';

export interface SectionTab {
  id: AccountTab;
  label: string;
  icon: IconName;
  count?: number;
}

/** Horizontal pill tabs for the account sections (dark = active). */
export function SectionTabs({
  tabs,
  active,
  onChange,
}: {
  tabs: SectionTab[];
  active: AccountTab;
  onChange: (id: AccountTab) => void;
}) {
  const palette = usePalette();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8, paddingHorizontal: 20, paddingBottom: 2 }}
    >
      {tabs.map((t) => {
        const on = t.id === active;
        return (
          <Pressable
            key={t.id}
            onPress={() => onChange(t.id)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 7,
              height: 40,
              paddingHorizontal: 15,
              borderRadius: 999,
              backgroundColor: on ? palette.text : palette.surface,
              borderWidth: 1,
              borderColor: on ? palette.text : palette.border2,
            }}
          >
            <Icon name={t.icon} size={16} color={on ? palette.bg : palette.text2} strokeWidth={2.1} />
            <Txt weight="semibold" style={{ fontSize: 14, color: on ? palette.bg : palette.text2 }}>
              {t.label}
            </Txt>
            {t.count != null ? (
              <View
                style={{
                  minWidth: 18,
                  height: 18,
                  paddingHorizontal: 5,
                  borderRadius: 9,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: on ? 'rgba(255,255,255,0.2)' : palette.surface3,
                }}
              >
                <Txt weight="bold" style={{ fontSize: 11.5, color: on ? palette.bg : palette.text2 }}>
                  {t.count}
                </Txt>
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
