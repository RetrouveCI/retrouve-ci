import type { LostItemRepository } from '@/domains/lost-items/repository/lost-item.repository'
import type {
	LostItem,
	LostItemType,
} from '@/domains/lost-items/types/lost-item.types'
import { MATCH_SCORE_THRESHOLD, MAX_CANDIDATES } from '../constants'
import type { MatchCandidate } from '../types/match.types'
import { computeMatchScore } from './compute-match-score'

const OPPOSITE_TYPE: Record<LostItemType, LostItemType> = {
	lost: 'found',
	found: 'lost',
}

/**
 * Takes the source item rather than its id: both callers have already resolved
 * it, and each applies its own rule to an unpublished one.
 */
export async function computeMatches(
	repository: LostItemRepository,
	source: LostItem,
): Promise<MatchCandidate[]> {
	const candidates = await repository.findMatchCandidates({
		type: OPPOSITE_TYPE[source.type],
		category: source.category,
		ville: source.ville,
		moderationStatus: 'published',
		resolutionStatus: 'active',
		limit: MAX_CANDIDATES,
	})

	return candidates
		.map(candidate => ({
			lostItem: candidate,
			score: computeMatchScore(source, candidate),
		}))
		.filter(match => match.score >= MATCH_SCORE_THRESHOLD)
		.sort((a, b) => b.score - a.score)
}
