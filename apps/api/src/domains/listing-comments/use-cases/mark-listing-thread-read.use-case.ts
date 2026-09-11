import { Injectable } from '@nestjs/common'
import { LostItemRepository } from '@/domains/lost-items/repository/lost-item.repository'
import type { IDomainUseCase } from '@/shared/types/domain-use-case.type'
import { requireThreadListing } from '../helpers/require-thread-listing'
import { ListingCommentRepository } from '../repository/listing-comment.repository'
import type { ThreadScope } from '../types/listing-comment.types'

interface MarkListingThreadReadInput {
	lostItemId: string
	scope: ThreadScope
}

/** Marks what the other side wrote: reading your own words reads nothing. */
@Injectable()
export class MarkListingThreadReadUseCase implements IDomainUseCase<
	MarkListingThreadReadInput,
	void
> {
	constructor(
		private readonly repository: ListingCommentRepository,
		private readonly lostItems: LostItemRepository,
	) {}

	async execute({
		lostItemId,
		scope,
	}: MarkListingThreadReadInput): Promise<void> {
		await requireThreadListing(this.lostItems, lostItemId, scope)
		await this.repository.markThreadRead(lostItemId, scope)
	}
}
