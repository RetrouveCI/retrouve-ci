import type {
	LostItem,
	PublicLostItem,
} from '@/domains/lost-items/types/lost-item.types'

export interface MatchCandidate {
	lostItem: LostItem
	score: number
}

/** What the matches of a listing may carry: the endpoint is anonymous. */
export interface PublicMatchCandidate {
	lostItem: PublicLostItem
	score: number
}
