import { Injectable } from '@nestjs/common'
import type { IDomainUseCase } from '@/shared/types/domain-use-case.type'
import { StickerOrderRepository } from '../repository/sticker-order.repository'
import type {
	ListStickerOrdersFilter,
	StickerOrderListResponse,
} from '../types/sticker-order.types'

interface GetMyStickerOrdersInput {
	userId: string
	filter: ListStickerOrdersFilter
}

@Injectable()
export class GetMyStickerOrdersUseCase implements IDomainUseCase<
	GetMyStickerOrdersInput,
	StickerOrderListResponse
> {
	constructor(private readonly repository: StickerOrderRepository) {}

	/** `userId` is applied last, so a filter carrying another one cannot widen the scope. */
	async execute({
		userId,
		filter,
	}: GetMyStickerOrdersInput): Promise<StickerOrderListResponse> {
		return this.repository.list({ ...filter, userId })
	}
}
