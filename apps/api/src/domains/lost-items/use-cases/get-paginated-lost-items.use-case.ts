import { Injectable } from '@nestjs/common'
import type { IDomainUseCase } from '@/shared/types/domain-use-case.type'
import { LostItemRepository } from '../repository/lost-item.repository'
import type {
	ListLostItemsFilter,
	LostItemListResponse,
} from '../types/lost-item.types'

@Injectable()
export class GetPaginatedLostItemsUseCase implements IDomainUseCase<
	ListLostItemsFilter,
	LostItemListResponse
> {
	constructor(private readonly repository: LostItemRepository) {}

	async execute(filter: ListLostItemsFilter): Promise<LostItemListResponse> {
		return this.repository.list(filter)
	}
}
