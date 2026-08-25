import { Injectable } from '@nestjs/common'
import type { IDomainUseCase } from '@/shared/types/domain-use-case.type'
import { StickerOrderRepository } from '../repository/sticker-order.repository'
import type {
	ListStickerOrdersFilter,
	StickerOrderListResponse,
} from '../types/sticker-order.types'

@Injectable()
export class GetPaginatedStickerOrdersUseCase implements IDomainUseCase<
	ListStickerOrdersFilter,
	StickerOrderListResponse
> {
	constructor(private readonly repository: StickerOrderRepository) {}

	async execute(
		filter: ListStickerOrdersFilter,
	): Promise<StickerOrderListResponse> {
		return this.repository.list(filter)
	}
}
