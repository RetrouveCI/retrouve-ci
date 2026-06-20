import { useQuery } from '@tanstack/react-query';

import { api } from './api.client';
import { mapLostItem, unwrapList, type ApiLostItem, type Paginated } from './mappers';
import type { Annonce, HomeStats } from './types';

/**
 * Annonces service — backed by the NestJS API (`/lost-items`). The public list
 * is anonymous; filtering stays client-side (see features/listings/filters).
 */

export const annoncesKeys = {
  all: ['annonces'] as const,
  list: (filters?: Record<string, unknown>) => ['annonces', 'list', filters ?? {}] as const,
  detail: (id: string) => ['annonces', 'detail', id] as const,
  stats: ['annonces', 'stats'] as const,
};

export async function fetchAnnonces(): Promise<Annonce[]> {
  const { data } = await api.get<Paginated<ApiLostItem> | ApiLostItem[]>('/lost-items', {
    params: { pageSize: 50 },
  });

  return unwrapList<ApiLostItem>(data).map(mapLostItem);
}

export async function fetchAnnonce(id: string): Promise<Annonce | undefined> {
  const { data } = await api.get<ApiLostItem>(`/lost-items/${id}`);
  return data ? mapLostItem(data) : undefined;
}

/** Home stats — not exposed by the API yet; keep representative figures. */
export function fetchHomeStats(): Promise<HomeStats> {
  return Promise.resolve({ itemsReturned: 1284, activeStickers: 6920 });
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
