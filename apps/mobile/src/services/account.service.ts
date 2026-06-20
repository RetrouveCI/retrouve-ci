import type { MyAnnonce, ObjectTone, Order, Sticker } from './types';

/** Categories offered when creating/editing one of the user's own listings. */
export const ANNONCE_CATEGORIES: { category: string; tone: ObjectTone }[] = [
  { category: 'Papiers', tone: 'doc' },
  { category: 'Clés', tone: 'key' },
  { category: 'Électronique', tone: 'phone' },
  { category: 'Bagages', tone: 'bag' },
  { category: 'Divers', tone: 'doc' },
];

export const MY_ANNONCES: MyAnnonce[] = [
  {
    id: 'm1',
    status: 'lost',
    title: 'Casque moto intégral noir',
    category: 'Divers',
    city: 'Abidjan',
    commune: 'Koumassi',
    dateLabel: '14 juin',
    timeLabel: 'il y a 1 j',
    views: 42,
    state: 'active',
    tone: 'bag',
  },
  {
    id: 'm2',
    status: 'found',
    title: 'Lunettes de vue',
    category: 'Divers',
    city: 'Abidjan',
    commune: 'Koumassi',
    dateLabel: '6 juin',
    timeLabel: 'il y a 9 j',
    views: 118,
    state: 'resolved',
    tone: 'doc',
  },
];

export const STICKERS: Sticker[] = [
  { id: 's1', code: 'RC-7K2-9XQ', object: 'Trousseau de clés maison', active: true, scans: 3, since: 'Activé le 2 juin' },
  { id: 's2', code: 'RC-4M8-1ZP', object: 'Sac à dos ordinateur', active: true, scans: 0, since: 'Activé le 28 mai' },
  { id: 's3', code: 'RC-A03-66B', object: null, active: false, scans: 0, since: 'Non activé' },
];

export const ORDERS: Order[] = [
  { id: 'c1', ref: '#RC-10428', title: 'Pack 5 stickers QR', qty: 5, price: '2 000 FCFA', status: 'Livré', date: '24 mai', tone: 'paid' },
  { id: 'c2', ref: '#RC-10571', title: 'Pack 10 stickers QR', qty: 10, price: '3 500 FCFA', status: 'En livraison', date: '11 juin', tone: 'shipping' },
];

/** Build a blank draft for a new listing. */
export function newAnnonceDraft(): MyAnnonce & { isNew: true } {
  return {
    id: 'm' + Date.now(),
    status: 'lost',
    title: '',
    category: 'Papiers',
    city: 'Abidjan',
    commune: 'Cocody',
    dateLabel: "Aujourd'hui",
    timeLabel: "à l'instant",
    views: 0,
    state: 'active',
    tone: 'doc',
    image: null,
    isNew: true,
  };
}
