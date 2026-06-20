import { useQuery } from '@tanstack/react-query';

import type { AppNotification } from './types';

/** Notifications service (mock for Phase 1 — see annonces.service for the pattern). */
const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'n1',
    kind: 'scan',
    title: 'Votre sticker a été scanné',
    body: 'Quelqu\'un a scanné le sticker de votre "Sac à dos Eastpak".',
    createdAt: new Date(Date.now() - 25 * 60_000).toISOString(),
    read: false,
  },
  {
    id: 'n2',
    kind: 'alert',
    title: 'Objet similaire retrouvé',
    body: 'Un téléphone Tecno Camon 20 a été déclaré retrouvé à Yopougon.',
    createdAt: new Date(Date.now() - 4 * 3600_000).toISOString(),
    read: false,
  },
  {
    id: 'n3',
    kind: 'system',
    title: 'Commande expédiée',
    body: 'Votre pack Famille de stickers est en cours de livraison.',
    createdAt: new Date(Date.now() - 28 * 3600_000).toISOString(),
    read: true,
  },
];

function delay<T>(value: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export const notificationsKeys = {
  all: ['notifications'] as const,
  unreadCount: ['notifications', 'unread-count'] as const,
};

export function fetchNotifications(): Promise<AppNotification[]> {
  return delay(MOCK_NOTIFICATIONS);
}

export function useNotifications() {
  return useQuery({ queryKey: notificationsKeys.all, queryFn: fetchNotifications });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: notificationsKeys.unreadCount,
    queryFn: fetchNotifications,
    select: (data) => data.filter((n) => !n.read).length,
  });
}
