import React, { forwardRef, useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';

import { Sheet, Txt, type SheetRef } from '@/components';
import { Icon, type IconName } from '@/design/Icon';
import { radius } from '@/design/tokens';
import { usePalette } from '@/design/useScheme';
import { timeAgo } from '@/lib/format';
import { useNotifications } from '@/services/notifications.service';
import type { AppNotification, NotificationKind } from '@/services/types';

type Filter = 'all' | NotificationKind;

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'Tous' },
  { key: 'scan', label: 'Scans' },
  { key: 'alert', label: 'Alertes' },
  { key: 'system', label: 'Système' },
];

const ICON_FOR: Record<NotificationKind, IconName> = {
  scan: 'scan',
  alert: 'bell',
  system: 'info',
};

/** Bottom sheet listing notifications with Tous/Scans/Alertes/Système filters. */
export const NotificationsSheet = forwardRef<SheetRef>(function NotificationsSheet(_props, ref) {
  const palette = usePalette();
  const [filter, setFilter] = useState<Filter>('all');
  const { data = [] } = useNotifications();

  const filtered = useMemo(
    () => (filter === 'all' ? data : data.filter((n) => n.kind === filter)),
    [data, filter],
  );

  return (
    <Sheet ref={ref} snapPoints={['72%']}>
      <Txt weight="bold" style={{ fontSize: 19, color: palette.text, marginBottom: 14 }}>
        Notifications
      </Txt>

      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
        {FILTERS.map((f) => {
          const active = f.key === filter;
          return (
            <Pressable
              key={f.key}
              onPress={() => setFilter(f.key)}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: radius.full,
                backgroundColor: active ? palette.green : palette.surface3,
              }}
            >
              <Txt
                weight="semibold"
                style={{ fontSize: 12.5, color: active ? '#FFFFFF' : palette.text2 }}
              >
                {f.label}
              </Txt>
            </Pressable>
          );
        })}
      </View>

      <View style={{ gap: 10 }}>
        {filtered.length === 0 ? (
          <Txt
            weight="medium"
            style={{ color: palette.text3, textAlign: 'center', paddingVertical: 24 }}
          >
            Aucune notification.
          </Txt>
        ) : (
          filtered.map((n) => <NotificationRow key={n.id} item={n} />)
        )}
      </View>
    </Sheet>
  );
});

function NotificationRow({ item }: { item: AppNotification }) {
  const palette = usePalette();
  return (
    <View
      style={{
        flexDirection: 'row',
        gap: 12,
        padding: 12,
        borderRadius: radius.md,
        backgroundColor: item.read ? 'transparent' : palette.greenSoft,
      }}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: radius.md,
          backgroundColor: palette.surface3,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon name={ICON_FOR[item.kind]} size={20} color={palette.green} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Txt weight="semibold" style={{ fontSize: 14, color: palette.text }}>
          {item.title}
        </Txt>
        <Txt weight="regular" style={{ fontSize: 12.5, color: palette.text2 }}>
          {item.body}
        </Txt>
        <Txt weight="medium" style={{ fontSize: 11, color: palette.text3, marginTop: 2 }}>
          {timeAgo(item.createdAt)}
        </Txt>
      </View>
    </View>
  );
}
