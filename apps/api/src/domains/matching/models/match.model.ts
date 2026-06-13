import type { LostItem } from '@/domains/lost-items/models/lost-item.model'

export interface MatchCandidate {
	lostItem: LostItem
	score: number
}
