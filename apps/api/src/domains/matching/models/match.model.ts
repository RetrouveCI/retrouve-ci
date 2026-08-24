import type { LostItem } from '@/domains/lost-items/types/lost-item.types'

export interface MatchCandidate {
	lostItem: LostItem
	score: number
}
