import { Inject, Injectable } from '@nestjs/common'
import { LostItemNotFoundError } from '@/domains/lost-items/errors/lost-item.errors'
import {
	LOST_ITEM_REPOSITORY,
	type LostItemRepository,
} from '@/domains/lost-items/repository/lost-item.repository'
import type { LostItemType } from '@/domains/lost-items/types/lost-item.types'
import { MATCH_SCORE_THRESHOLD, MAX_CANDIDATES } from '../constants'
import { computeMatchScore } from '../helpers/compute-match-score'
import type { MatchCandidate } from '../models/match.model'

const OPPOSITE_TYPE: Record<LostItemType, LostItemType> = {
	lost: 'found',
	found: 'lost',
}

@Injectable()
export class MatchingUseCases {
	constructor(
		@Inject(LOST_ITEM_REPOSITORY)
		private readonly lostItemRepository: LostItemRepository,
	) {}

	async findMatches(id: string): Promise<MatchCandidate[]> {
		const source = await this.lostItemRepository.findById(id)

		if (!source) {
			throw new LostItemNotFoundError(id)
		}

		const { items: candidates } = await this.lostItemRepository.list({
			type: OPPOSITE_TYPE[source.type],
			resolutionStatus: 'active',
			page: 1,
			pageSize: MAX_CANDIDATES,
		})

		return candidates
			.map((candidate) => ({
				lostItem: candidate,
				score: computeMatchScore(source, candidate),
			}))
			.filter((match) => match.score >= MATCH_SCORE_THRESHOLD)
			.sort((a, b) => b.score - a.score)
	}
}
