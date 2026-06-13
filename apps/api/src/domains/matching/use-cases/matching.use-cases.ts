import { Inject, Injectable } from '@nestjs/common'
import { LostItemNotFoundError } from '@/domains/lost-items/errors/lost-item.errors'
import type { LostItem } from '@/domains/lost-items/models/lost-item.model'
import {
	LOST_ITEM_REPOSITORY,
	type LostItemRepository,
} from '@/domains/lost-items/repository/lost-item.repository'
import type { LostItemType } from '@/domains/lost-items/types/lost-item.types'
import {
	NOTIFICATION_REPOSITORY,
	type NotificationRepository,
} from '@/domains/notifications/repository/notification.repository'
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
		@Inject(NOTIFICATION_REPOSITORY)
		private readonly notificationRepository: NotificationRepository,
	) {}

	async findMatches(id: string): Promise<MatchCandidate[]> {
		const { matches } = await this.computeMatches(id)

		return matches
	}

	async notifyMatches(id: string): Promise<void> {
		const { source, matches } = await this.computeMatches(id)

		const relevantMatches = matches.filter(
			match => match.lostItem.userId !== source.userId,
		)

		await Promise.all(
			relevantMatches.map(match =>
				this.notificationRepository.create({
					type: 'match_found',
					title: 'Correspondance trouvée',
					message: `Une annonce correspondant à "${source.title}" a été trouvée.`,
					link: `/posts/${match.lostItem.id}`,
					userId: source.userId,
				}),
			),
		)
	}

	private async computeMatches(
		id: string,
	): Promise<{ source: LostItem; matches: MatchCandidate[] }> {
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

		const matches = candidates
			.map(candidate => ({
				lostItem: candidate,
				score: computeMatchScore(source, candidate),
			}))
			.filter(match => match.score >= MATCH_SCORE_THRESHOLD)
			.sort((a, b) => b.score - a.score)

		return { source, matches }
	}
}
