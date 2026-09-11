import { Injectable } from '@nestjs/common'
import type { IDomainUseCase } from '@/shared/types/domain-use-case.type'
import { ListingCommentRepository } from '../repository/listing-comment.repository'
import type { ThreadScope, UnreadThread } from '../types/listing-comment.types'

/** The listings holding something the caller has not read: what both lists mark. */
@Injectable()
export class GetUnreadListingThreadsUseCase implements IDomainUseCase<
	ThreadScope,
	UnreadThread[]
> {
	constructor(private readonly repository: ListingCommentRepository) {}

	execute(scope: ThreadScope): Promise<UnreadThread[]> {
		return this.repository.listUnreadThreads(scope)
	}
}
