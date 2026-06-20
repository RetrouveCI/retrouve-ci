import type { ItemStatus } from '@/components';

export interface Annonce {
  id: string;
  title: string;
  status: ItemStatus;
  category: string;
  city: string;
  commune: string;
  imageUrl: string | null;
  description: string;
  contactPhone: string;
  createdAt: string;
}

export type NotificationKind = 'scan' | 'alert' | 'system';

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
}

export interface HomeStats {
  itemsReturned: number;
  activeStickers: number;
}

/** Ivorian cities used across the app (mock — to be replaced by the API). */
export const CITIES = [
  'Abidjan',
  'Bouaké',
  'Yamoussoukro',
  'San-Pédro',
  'Korhogo',
  'Daloa',
  'Man',
  'Gagnoa',
  'Abengourou',
  'Divo',
] as const;

/** Abidjan communes used by the listings/order filters. */
export const ABIDJAN_COMMUNES = [
  'Cocody',
  'Yopougon',
  'Marcory',
  'Treichville',
  'Plateau',
  'Adjamé',
  'Abobo',
  'Koumassi',
  'Port-Bouët',
  'Attécoubé',
  'Bingerville',
  'Anyama',
] as const;
