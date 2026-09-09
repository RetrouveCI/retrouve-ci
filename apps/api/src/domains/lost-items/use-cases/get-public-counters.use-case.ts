import { Injectable } from '@nestjs/common'
import type { IDomainUseCase } from '@/shared/types/domain-use-case.type'
import { LostItemRepository } from '../repository/lost-item.repository'
import type { PublicCounters } from '../types/lost-item.types'

// §3 forbids a reassurance figure written by hand, so both are counted — and a
// front draws nothing rather than announcing a zero.
@Injectable()
export class GetPublicCountersUseCase implements IDomainUseCase<
	void,
	PublicCounters
> {
	constructor(private readonly repository: LostItemRepository) {}

	async execute(): Promise<PublicCounters> {
		const [published, resolvedThisMonth] = await Promise.all([
			this.repository.countPublished(),
			this.repository.countResolvedSince(startOfMonth(new Date())),
		])

		return { published, resolvedThisMonth }
	}
}

function startOfMonth(now: Date): Date {
	return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
}
