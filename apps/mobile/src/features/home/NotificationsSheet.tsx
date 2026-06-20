import React, { forwardRef, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { Sheet, Txt, type SheetRef } from '@/components';
import { Icon, type IconName } from '@/design/Icon';
import { usePalette } from '@/design/useScheme';
import { useNotifications } from '@/services/notifications.service';
import type { AppNotification, NotificationType } from '@/services/types';

type Filter = 'all' | 'unread' | 'scan' | 'annonces' | 'order';

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'Tout' },
  { id: 'unread', label: 'Non lues' },
  { id: 'scan', label: 'Scans' },
  { id: 'annonces', label: 'Annonces' },
  { id: 'order', label: 'Commandes' },
];

const META: Record<NotificationType, { icon: IconName; tone: 'green' | 'orange' }> = {
  scan: { icon: 'qr', tone: 'green' },
  match: { icon: 'search', tone: 'orange' },
  order: { icon: 'package', tone: 'green' },
  resolved: { icon: 'checkCircle', tone: 'green' },
  info: { icon: 'info', tone: 'green' },
};

function matchesFilter(n: AppNotification, f: Filter) {
  if (f === 'all') return true;
  if (f === 'unread') return n.unread;
  if (f === 'scan') return n.type === 'scan';
  if (f === 'annonces') return n.type === 'match' || n.type === 'resolved';
  if (f === 'order') return n.type === 'order';
  return true;
}

/** Bottom sheet listing notifications with Tout/Non lues/Scans/Annonces/Commandes filters. */
export const NotificationsSheet = forwardRef<SheetRef>(function NotificationsSheet(_props, ref) {
  const palette = usePalette();
  const [filter, setFilter] = useState<Filter>('all');
  const { data } = useNotifications();
  const [items, setItems] = useState<AppNotification[]>([]);

  useEffect(() => {
    if (data) setItems(data);
  }, [data]);

  const unread = items.filter((n) => n.unread).length;
  const shown = useMemo(() => items.filter((n) => matchesFilter(n, filter)), [items, filter]);

  const readAll = () => setItems((list) => list.map((n) => ({ ...n, unread: false })));
  const readOne = (id: string) =>
    setItems((list) => list.map((n) => (n.id === id ? { ...n, unread: false } : n)));

  return (
    <Sheet ref={ref} snapPoints={['92%']}>
      <Txt weight="bold" style={{ fontSize: 19, color: palette.text, marginBottom: 14 }}>
        Notifications
      </Txt>

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingBottom: 12 }}
      >
        {FILTERS.map((f) => {
          const on = f.id === filter;
          const count = f.id === 'unread' ? unread : null;
          return (
            <Pressable
              key={f.id}
              onPress={() => setFilter(f.id)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                height: 36,
                paddingHorizontal: 14,
                borderRadius: 999,
                backgroundColor: on ? palette.text : palette.surface2,
                borderWidth: 1,
                borderColor: on ? palette.text : palette.border2,
              }}
            >
              <Txt weight="semibold" style={{ fontSize: 13.5, color: on ? palette.bg : palette.text2 }}>
                {f.label}
              </Txt>
              {count && count > 0 ? (
                <View
                  style={{
                    minWidth: 18,
                    height: 18,
                    paddingHorizontal: 5,
                    borderRadius: 9,
                    backgroundColor: on ? 'rgba(255,255,255,0.22)' : palette.orange,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Txt weight="bold" style={{ fontSize: 11, color: on ? palette.bg : '#FFFFFF' }}>
                    {count}
                  </Txt>
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Count + mark-all-read */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 10,
        }}
      >
        <Txt weight="medium" style={{ fontSize: 13, color: palette.text2 }}>
          {shown.length} notification{shown.length > 1 ? 's' : ''}
          {filter === 'all' && unread > 0 ? ` · ${unread} non lue${unread > 1 ? 's' : ''}` : ''}
        </Txt>
        {unread > 0 ? (
          <Pressable
            onPress={readAll}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 5, padding: 4 }}
          >
            <Icon name="check" size={15} color={palette.green} strokeWidth={2.4} />
            <Txt weight="semibold" style={{ fontSize: 13, color: palette.green }}>
              Tout lire
            </Txt>
          </Pressable>
        ) : null}
      </View>

      {/* Rows */}
      {shown.length === 0 ? (
        <Txt
          weight="medium"
          style={{ color: palette.text3, textAlign: 'center', paddingVertical: 28 }}
        >
          Aucune notification dans cette catégorie.
        </Txt>
      ) : (
        <View style={{ gap: 8 }}>
          {shown.map((n) => (
            <NotificationRow key={n.id} item={n} onPress={() => readOne(n.id)} />
          ))}
        </View>
      )}
    </Sheet>
  );
});

function NotificationRow({ item, onPress }: { item: AppNotification; onPress: () => void }) {
  const palette = usePalette();
  const meta = META[item.type] ?? META.info;
  const color = meta.tone === 'orange' ? palette.orangeDark : palette.green;
  const soft = meta.tone === 'orange' ? palette.orangeSoft : palette.greenSoft;

  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: 'row',
        gap: 13,
        padding: 13,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: palette.border,
        backgroundColor: item.unread ? palette.greenSoft : palette.surface,
      }}
    >
      <View
        style={{
          width: 42,
          height: 42,
          borderRadius: 13,
          backgroundColor: soft,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon name={meta.icon} size={21} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Txt weight="semibold" style={{ fontSize: 14.5, color: palette.text, flex: 1 }}>
            {item.title}
          </Txt>
          {item.unread ? (
            <View
              style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: palette.orange }}
            />
          ) : null}
        </View>
        <Txt weight="regular" style={{ fontSize: 13, color: palette.text2, marginTop: 3, lineHeight: 18 }}>
          {item.body}
        </Txt>
        <Txt weight="regular" style={{ fontSize: 12, color: palette.text3, marginTop: 6 }}>
          {item.timeLabel}
        </Txt>
      </View>
    </Pressable>
  );
}
