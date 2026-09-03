import { Injectable } from '@nestjs/common'
import type { IDomainUseCase } from '@/shared/types/domain-use-case.type'
import { toPublicLostItem } from '../mappers/lost-item.mapper'
import { LostItemRepository } from '../repository/lost-item.repository'
import type {
	ListLostItemsFilter,
	PublicLostItemListResponse,
} from '../types/lost-item.types'

/**
 * The listing page. Publication is applied last, so a filter carrying another
 * moderation status cannot widen the scope, and every row is projected.
 */
@Injectable()
export class GetPublicLostItemsUseCase implements IDomainUseCase<
	ListLostItemsFilter,
	PublicLostItemListResponse
> {
	constructor(private readonly repository: LostItemRepository) {}

	async execute(
		filter: ListLostItemsFilter,
	): Promise<PublicLostItemListResponse> {
		const page = await this.repository.list({
			...filter,
			moderationStatus: 'published',
		})

		return { ...page, items: page.items.map(toPublicLostItem) }
	}
}
