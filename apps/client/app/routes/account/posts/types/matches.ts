import type { LostItem } from '@/shared/types/lost-item'

export interface ListingMatches {
	count: number
	items: LostItem[]
}

/** One entry per listing that has at least one match; the others are absent. */
export type ListingMatchesMap = Record<string, ListingMatches>
