import { useQuery } from '@tanstack/react-query';

import type { Annonce, HomeStats } from './types';

/**
 * Annonces service. For Phase 1 these return coherent Ivorian mock data with a
 * simulated latency. When the NestJS endpoints are wired (Orval), swap the
 * bodies of `fetchAnnonces` / `fetchAnnonce` for real `api` calls — the hooks
 * and query keys stay the same.
 */
const MOCK_ANNONCES: Annonce[] = [
  {
    id: 'a1',
    title: 'Sac à dos Eastpak noir',
    status: 'lost',
    category: 'Bagagerie',
    city: 'Abidjan',
    commune: 'Cocody',
    imageUrl: null,
    description: 'Perdu près de la pharmacie Saint Jean, contient des documents.',
    contactPhone: '+2250708112233',
    createdAt: new Date(Date.now() - 2 * 3600_000).toISOString(),
  },
  {
    id: 'a2',
    title: 'Trousseau de clés avec porte-clés rouge',
    status: 'found',
    category: 'Clés',
    city: 'Abidjan',
    commune: 'Marcory',
    imageUrl: null,
    description: 'Trouvé devant la station Total de Marcory Zone 4.',
    contactPhone: '+2250575004411',
    createdAt: new Date(Date.now() - 6 * 3600_000).toISOString(),
  },
  {
    id: 'a3',
    title: 'Téléphone Tecno Camon 20',
    status: 'lost',
    category: 'Électronique',
    city: 'Abidjan',
    commune: 'Yopougon',
    imageUrl: null,
    description: 'Coque bleue, perdu dans un gbaka en direction de Yopougon.',
    contactPhone: '+2250102938475',
    createdAt: new Date(Date.now() - 26 * 3600_000).toISOString(),
  },
  {
    id: 'a4',
    title: "Carte d'identité au nom de Koffi A.",
    status: 'found',
    category: 'Papiers',
    city: 'Bouaké',
    commune: 'Bouaké',
    imageUrl: null,
    description: 'CNI trouvée au marché de Bouaké, à récupérer rapidement.',
    contactPhone: '+2250709887766',
    createdAt: new Date(Date.now() - 2 * 86400_000).toISOString(),
  },
  {
    id: 'a5',
    title: 'Montre connectée grise',
    status: 'resolved',
    category: 'Accessoires',
    city: 'Abidjan',
    commune: 'Plateau',
    imageUrl: null,
    description: 'Rendue à son propriétaire grâce au sticker RetrouveCI.',
    contactPhone: '+2250544221100',
    createdAt: new Date(Date.now() - 3 * 86400_000).toISOString(),
  },
];

const MOCK_STATS: HomeStats = { itemsReturned: 1284, activeStickers: 5630 };

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
