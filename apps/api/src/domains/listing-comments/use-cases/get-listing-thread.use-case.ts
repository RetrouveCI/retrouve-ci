import { Injectable } from '@nestjs/common'
import { LostItemRepository } from '@/domains/lost-items/repository/lost-item.repository'
import type { IDomainUseCase } from '@/shared/types/domain-use-case.type'
import { requireThreadListing } from '../helpers/require-thread-listing'
import { toListingCommentView } from '../mappers/listing-comment.mapper'
import { ListingCommentRepository } from '../repository/listing-comment.repository'
import type {
	ListingCommentView,
	ThreadScope,
} from '../types/listing-comment.types'

interface GetListingThreadInput {
	lostItemId: string
	scope: ThreadScope
}

@Injectable()
export class GetListingThreadUseCase implements IDomainUseCase<
	GetListingThreadInput,
	ListingCommentView[]
> {
	constructor(
		private readonly repository: ListingCommentRepository,
		private readonly lostItems: LostItemRepository,
	) {}

	async execute({
		lostItemId,
		scope,
	}: GetListingThreadInput): Promise<ListingCommentView[]> {
		await requireThreadListing(this.lostItems, lostItemId, scope)

		const comments = await this.repository.listThread(lostItemId, scope)

		return comments.map(toListingCommentView)
	}
}
