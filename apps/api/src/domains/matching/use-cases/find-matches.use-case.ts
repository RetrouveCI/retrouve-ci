import { Injectable } from '@nestjs/common'
import { requirePublishedLostItem } from '@/domains/lost-items/helpers/require-published-lost-item'
import { toPublicLostItem } from '@/domains/lost-items/mappers/lost-item.mapper'
import { LostItemRepository } from '@/domains/lost-items/repository/lost-item.repository'
import type { IDomainUseCase } from '@/shared/types/domain-use-case.type'
import { computeMatches } from '../helpers/compute-matches'
import type { PublicMatchCandidate } from '../types/match.types'

@Injectable()
export class FindMatchesUseCase implements IDomainUseCase<
	string,
	PublicMatchCandidate[]
> {
	constructor(private readonly lostItemRepository: LostItemRepository) {}

	/** The route is anonymous, so every candidate is projected. */
	async execute(id: string): Promise<PublicMatchCandidate[]> {
		const source = await requirePublishedLostItem(this.lostItemRepository, id)
		const matches = await computeMatches(this.lostItemRepository, source)

		return matches.map(({ lostItem, score }) => ({
			lostItem: toPublicLostItem(lostItem),
			score,
		}))
	}
}
