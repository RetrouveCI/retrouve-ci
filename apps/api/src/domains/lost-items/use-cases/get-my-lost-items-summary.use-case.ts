import { Injectable } from '@nestjs/common'
import type { IDomainUseCase } from '@/shared/types/domain-use-case.type'
import { LostItemRepository } from '../repository/lost-item.repository'
import type { LostItemOwnerSummary } from '../types/lost-item.types'

@Injectable()
export class GetMyLostItemsSummaryUseCase implements IDomainUseCase<
	string,
	LostItemOwnerSummary
> {
	constructor(private readonly repository: LostItemRepository) {}

	/** The caller's own id is the only scope; there is no filter to widen it. */
	async execute(userId: string): Promise<LostItemOwnerSummary> {
		return this.repository.summarizeByOwner(userId)
	}
}
