/**
 * Domain types for RetrouveCI. Field names are English (project convention);
 * user-facing values stay in French. Mock data mirrors the Claude Design
 * prototype 1:1 and will be swapped for the NestJS API (Orval) later.
 */

export type AnnonceStatus = 'lost' | 'found';

/** Visual category used by the striped ObjectThumb placeholder. */
export type ObjectTone = 'doc' | 'key' | 'phone' | 'bag';

export interface Annonce {
  id: string;
  status: AnnonceStatus;
  title: string;
  category: string;
  city: string;
  commune: string | null;
  dateLabel: string;
  timeLabel: string;
  author: string;
  phone: string;
  tone: ObjectTone;
  description: string;
  image?: string | null;
}

export type NotificationType = 'scan' | 'match' | 'order' | 'resolved' | 'info';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  timeLabel: string;
  unread: boolean;
}

export interface HomeStats {
  itemsReturned: number;
  activeStickers: number;
}

export type AnnonceState = 'active' | 'resolved';

/** A listing owned by the current user (account "Mes annonces"). */
export interface MyAnnonce {
  id: string;
  status: AnnonceStatus;
  title: string;
  category: string;
  city: string;
  commune: string | null;
  dateLabel: string;
  timeLabel: string;
  views: number;
  state: AnnonceState;
  tone: ObjectTone;
  image?: string | null;
  description?: string;
}

export interface Sticker {
  id: string;
  code: string;
  object: string | null;
  active: boolean;
  scans: number;
  since: string;
}

export type OrderTone = 'paid' | 'shipping';

export interface Order {
  id: string;
  ref: string;
  title: string;
  qty: number;
  price: string;
  status: string;
  date: string;
  tone: OrderTone;
}

export interface AppUser {
  name: string;
  phone: string;
  initials: string;
  location: string;
}

/** Ivorian cities (mock — replaced by the API). */
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

export const CURRENT_USER: AppUser = {
  name: 'Adjoua Konan',
  phone: '+225 07 08 45 11 27',
  initials: 'AK',
  location: 'Abidjan · Cocody',
};
