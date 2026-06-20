import { timeAgo } from '@/lib/format';

import type { Annonce, AnnonceStatus, ObjectTone } from './types';

const MONTHS = [
  'janv.',
  'févr.',
  'mars',
  'avril',
  'mai',
  'juin',
  'juil.',
  'août',
  'sept.',
  'oct.',
  'nov.',
  'déc.',
];

/** Short French date label, e.g. "18 juin". */
export function shortDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()] ?? ''}`.trim();
}

const CATEGORY_LABEL: Record<string, string> = {
  phone: 'Électronique',
  electronics: 'Électronique',
  keys: 'Clés',
  wallet: 'Bagages',
  bag: 'Bagages',
  documents: 'Papiers',
  clothing: 'Vêtements',
  jewelry: 'Bijoux',
  other: 'Divers',
};

const CATEGORY_TONE: Record<string, ObjectTone> = {
  phone: 'phone',
  electronics: 'phone',
  keys: 'key',
  wallet: 'bag',
  bag: 'bag',
  documents: 'doc',
  clothing: 'doc',
  jewelry: 'doc',
  other: 'doc',
};

/** Raw lost-item shape returned by the API (enums serialized lowercase). */
export interface ApiLostItem {
  id: string;
  type: string;
  category: string;
  title: string;
  description: string;
  ville: string;
  commune: string | null;
  eventDate: string;
  contactName: string;
  contactWhatsapp: string;
  photos: string[];
  resolutionStatus: string;
  views: number;
  createdAt: string;
}

/** Map an API lost-item to the app's Annonce shape (English fields, FR values). */
export function mapLostItem(item: ApiLostItem): Annonce {
  const category = item.category?.toLowerCase() ?? 'other';
  return {
    id: item.id,
    status: (item.type?.toLowerCase() as AnnonceStatus) === 'found' ? 'found' : 'lost',
    title: item.title,
    description: item.description,
    category: CATEGORY_LABEL[category] ?? 'Divers',
    city: item.ville,
    commune: item.commune ?? null,
    dateLabel: shortDate(item.eventDate),
    timeLabel: timeAgo(item.createdAt),
    author: item.contactName,
    phone: item.contactWhatsapp,
    tone: CATEGORY_TONE[category] ?? 'doc',
    image: item.photos?.[0] ?? null,
  };
}

/** Paginated list envelope (`{ items, total, page, pageSize }`). */
export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export function unwrapList<T>(data: Paginated<T> | T[]): T[] {
  return Array.isArray(data) ? data : (data?.items ?? []);
}
