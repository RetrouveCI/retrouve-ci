import { Injectable } from '@nestjs/common'
import { requirePublishedLostItem } from '@/domains/lost-items/helpers/require-published-lost-item'
import { LostItemRepository } from '@/domains/lost-items/repository/lost-item.repository'
import type { IDomainUseCase } from '@/shared/types/domain-use-case.type'
import { computeMatches } from '../helpers/compute-matches'
import type { MatchCandidate } from '../types/match.types'

@Injectable()
export class FindMatchesUseCase implements IDomainUseCase<
	string,
	MatchCandidate[]
> {
	constructor(private readonly lostItemRepository: LostItemRepository) {}

	async execute(id: string): Promise<MatchCandidate[]> {
		const source = await requirePublishedLostItem(this.lostItemRepository, id)

		return computeMatches(this.lostItemRepository, source)
	}
}
