import { useQuery } from '@tanstack/react-query';

import type { Annonce, HomeStats } from './types';

/**
 * Annonces service. Mirrors the prototype's mock data (Ivorian listings) with a
 * simulated latency. When the NestJS endpoints are wired (Orval), swap the
 * bodies of `fetchAnnonces` / `fetchAnnonce` for real `api` calls — the hooks
 * and query keys stay the same.
 */
const MOCK_ANNONCES: Annonce[] = [
  {
    id: 'a1',
    status: 'found',
    title: "Carte Nationale d'Identité",
    category: 'Papiers',
    city: 'Abidjan',
    commune: 'Cocody',
    dateLabel: '14 juin',
    timeLabel: 'il y a 1 j',
    author: 'Aya Koné',
    phone: '+225 07 08 12 44 90',
    tone: 'doc',
    description:
      "CNI trouvée près de la pharmacie des II Plateaux. Le nom commence par K. À récupérer après vérification d'identité.",
  },
  {
    id: 'a2',
    status: 'lost',
    title: 'Trousseau de clés + porte-clés rouge',
    category: 'Clés',
    city: 'Abidjan',
    commune: 'Marcory',
    dateLabel: '13 juin',
    timeLabel: 'il y a 2 j',
    author: 'Kouassi Yao',
    phone: '+225 05 64 21 07 33',
    tone: 'key',
    description:
      'Perdu un trousseau de 4 clés avec un porte-clés en forme de ballon rouge, entre Marcory Zone 4 et le marché.',
  },
  {
    id: 'a3',
    status: 'found',
    title: 'Téléphone Tecno Spark',
    category: 'Électronique',
    city: 'Abidjan',
    commune: 'Yopougon',
    dateLabel: '13 juin',
    timeLabel: 'il y a 2 j',
    author: 'Fatou Diabaté',
    phone: '+225 01 22 88 54 10',
    tone: 'phone',
    description:
      'Téléphone retrouvé dans un gbaka ligne Yopougon–Adjamé. Écran fissuré en haut à droite. Coque bleue.',
  },
  {
    id: 'a4',
    status: 'lost',
    title: 'Permis de conduire',
    category: 'Papiers',
    city: 'Bouaké',
    commune: null,
    dateLabel: '12 juin',
    timeLabel: 'il y a 3 j',
    author: 'Ibrahim Touré',
    phone: '+225 07 47 90 23 65',
    tone: 'doc',
    description:
      'Permis catégorie B perdu au quartier Air France. Récompense pour la personne qui le retrouve.',
  },
  {
    id: 'a5',
    status: 'found',
    title: "Sac à dos d'école",
    category: 'Bagages',
    city: 'Abidjan',
    commune: 'Abobo',
    dateLabel: '11 juin',
    timeLabel: 'il y a 4 j',
    author: 'Mariam Bamba',
    phone: '+225 05 10 76 32 88',
    tone: 'bag',
    description:
      "Sac à dos noir avec cahiers au nom d'un élève de 4ème. Retrouvé devant le collège moderne d'Abobo.",
  },
  {
    id: 'a6',
    status: 'lost',
    title: 'Carte étudiante + carnet',
    category: 'Papiers',
    city: 'Abidjan',
    commune: 'Cocody',
    dateLabel: '10 juin',
    timeLabel: 'il y a 5 j',
    author: 'Adjoua Konan',
    phone: '+225 01 90 45 11 27',
    tone: 'doc',
    description:
      "Carte étudiante de l'Université FHB et carnet de notes perdus sur le campus, côté amphi B.",
  },
  {
    id: 'a7',
    status: 'found',
    title: 'Montre connectée',
    category: 'Électronique',
    city: 'San-Pédro',
    commune: null,
    dateLabel: '9 juin',
    timeLabel: 'il y a 6 j',
    author: 'Seydou Coulibaly',
    phone: '+225 07 33 60 78 12',
    tone: 'phone',
    description:
      'Montre retrouvée sur la plage. Bracelet noir, écran rond. À identifier par le propriétaire.',
  },
  {
    id: 'a8',
    status: 'lost',
    title: 'Portefeuille en cuir marron',
    category: 'Bagages',
    city: 'Abidjan',
    commune: 'Plateau',
    dateLabel: '8 juin',
    timeLabel: 'il y a 7 j',
    author: 'Awa Sangaré',
    phone: '+225 05 80 14 99 02',
    tone: 'bag',
    description:
      'Portefeuille perdu au Plateau près de la gare Sud. Contient pièces et cartes. Sans valeur pour autrui.',
  },
];

const MOCK_STATS: HomeStats = { itemsReturned: 1284, activeStickers: 6920 };

function delay<T>(value: T, ms = 350): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export const annoncesKeys = {
  all: ['annonces'] as const,
  list: (filters?: Record<string, unknown>) => ['annonces', 'list', filters ?? {}] as const,
  detail: (id: string) => ['annonces', 'detail', id] as const,
  stats: ['annonces', 'stats'] as const,
};

export function fetchAnnonces(): Promise<Annonce[]> {
  return delay(MOCK_ANNONCES);
}

export function fetchAnnonce(id: string): Promise<Annonce | undefined> {
  return delay(MOCK_ANNONCES.find((a) => a.id === id));
}

export function fetchHomeStats(): Promise<HomeStats> {
  return delay(MOCK_STATS);
}

export function useAnnonces() {
  return useQuery({ queryKey: annoncesKeys.list(), queryFn: fetchAnnonces });
}

export function useRecentAnnonces() {
  return useQuery({
    queryKey: annoncesKeys.list(),
    queryFn: fetchAnnonces,
    select: (data) => data.slice(0, 5),
  });
}

export function useHomeStats() {
  return useQuery({ queryKey: annoncesKeys.stats, queryFn: fetchHomeStats });
}
