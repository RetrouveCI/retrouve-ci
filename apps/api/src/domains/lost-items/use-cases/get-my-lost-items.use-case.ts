import { Injectable } from '@nestjs/common'
import type { IDomainUseCase } from '@/shared/types/domain-use-case.type'
import { LostItemRepository } from '../repository/lost-item.repository'
import type {
	ListLostItemsFilter,
	LostItemListResponse,
} from '../types/lost-item.types'

interface GetMyLostItemsInput {
	userId: string
	filter: ListLostItemsFilter
}

@Injectable()
export class GetMyLostItemsUseCase implements IDomainUseCase<
	GetMyLostItemsInput,
	LostItemListResponse
> {
	constructor(private readonly repository: LostItemRepository) {}

	/** `userId` is applied last, so a filter carrying another one cannot widen the scope. */
	async execute({
		userId,
		filter,
	}: GetMyLostItemsInput): Promise<LostItemListResponse> {
		return this.repository.list({ ...filter, userId })
	}
}
