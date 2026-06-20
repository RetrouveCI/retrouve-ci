import { useQuery } from '@tanstack/react-query';

import type { AppNotification } from './types';

/** Notifications service (mock — mirrors the prototype's 12 notifications). */
const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'n1',
    type: 'scan',
    title: 'Votre sticker a été scanné',
    body: "Quelqu'un a scanné « Trousseau de clés » à Marcory. Consultez le message.",
    timeLabel: 'il y a 12 min',
    unread: true,
  },
  {
    id: 'n2',
    type: 'match',
    title: 'Objet retrouvé près de vous',
    body: "Une pièce d'identité a été signalée comme retrouvée à Cocody.",
    timeLabel: 'il y a 2 h',
    unread: true,
  },
  {
    id: 'n3',
    type: 'order',
    title: 'Commande expédiée',
    body: 'Votre pack Famille (8 stickers QR) est en route. Livraison sous 48 h.',
    timeLabel: 'Hier',
    unread: true,
  },
  {
    id: 'n4',
    type: 'scan',
    title: 'Nouveau scan de votre sticker',
    body: "« Ordinateur portable » vient d'être scanné au Plateau.",
    timeLabel: 'Hier',
    unread: true,
  },
  {
    id: 'n5',
    type: 'resolved',
    title: 'Annonce résolue',
    body: 'Votre annonce « Lunettes de vue » a été marquée comme résolue. Bravo !',
    timeLabel: 'il y a 3 j',
    unread: false,
  },
  {
    id: 'n6',
    type: 'match',
    title: 'Nouvelle annonce dans votre zone',
    body: '3 nouveaux objets retrouvés ont été publiés à Cocody aujourd’hui.',
    timeLabel: 'il y a 3 j',
    unread: false,
  },
  {
    id: 'n7',
    type: 'order',
    title: 'Commande livrée',
    body: 'Votre pack 5 stickers QR a bien été livré. Pensez à les activer.',
    timeLabel: 'il y a 5 j',
    unread: false,
  },
  {
    id: 'n8',
    type: 'scan',
    title: 'Votre sticker a été scanné',
    body: '« Sac à dos » a été scanné à Yopougon. Un message vous attend.',
    timeLabel: 'il y a 6 j',
    unread: false,
  },
  {
    id: 'n9',
    type: 'match',
    title: 'Correspondance possible',
    body: 'Un téléphone retrouvé ressemble à votre annonce « Tecno Spark ».',
    timeLabel: 'il y a 1 sem',
    unread: false,
  },
  {
    id: 'n10',
    type: 'order',
    title: 'Paiement confirmé',
    body: 'Votre paiement de 3 500 FCFA par MTN MoMo a été reçu.',
    timeLabel: 'il y a 1 sem',
    unread: false,
  },
  {
    id: 'n11',
    type: 'resolved',
    title: 'Objet récupéré',
    body: 'Félicitations ! Vous avez récupéré « Casque moto ». Laissez un avis.',
    timeLabel: 'il y a 2 sem',
    unread: false,
  },
  {
    id: 'n12',
    type: 'info',
    title: 'Bienvenue sur RetrouveCI',
    body: 'Activez vos premiers stickers pour protéger vos objets de valeur.',
    timeLabel: 'il y a 3 sem',
    unread: false,
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
    queryKey: notificationsKeys.all,
    queryFn: fetchNotifications,
    select: (data) => data.filter((n) => n.unread).length,
  });
}
