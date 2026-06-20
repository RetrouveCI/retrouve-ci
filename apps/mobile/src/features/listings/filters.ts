import type { Annonce } from '@/services/types';

export const PERIODS = [
  'Toutes les dates',
  "Aujourd'hui",
  '7 derniers jours',
  '30 derniers jours',
  'Cette année',
] as const;

export type Period = (typeof PERIODS)[number];
export type StatusFilter = 'all' | 'lost' | 'found';

export interface ListingsFilters {
  city: string | null;
  commune: string | null;
  period: Period;
}

export const DEFAULT_FILTERS: ListingsFilters = {
  city: null,
  commune: null,
  period: PERIODS[0],
};

/** Number of non-default filters currently applied (drives the badge). */
export function activeFilterCount(f: ListingsFilters): number {
  return (f.city ? 1 : 0) + (f.commune ? 1 : 0) + (f.period !== PERIODS[0] ? 1 : 0);
}

/**
 * Apply the status + search + city/commune filters. NB: like the prototype, the
 * period filter is cosmetic (the mock annonces carry no machine date) and is not
 * applied here.
 */
export function filterAnnonces(
  annonces: Annonce[],
  status: StatusFilter,
  filters: ListingsFilters,
  search: string,
): Annonce[] {
  const q = search.trim().toLowerCase();
  return annonces.filter((a) => {
    if (status !== 'all' && a.status !== status) return false;
    if (filters.city && a.city !== filters.city) return false;
    if (filters.commune && a.commune !== filters.commune) return false;
    if (q) {
      const haystack = `${a.title} ${a.city} ${a.commune ?? ''} ${a.category}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });
}
