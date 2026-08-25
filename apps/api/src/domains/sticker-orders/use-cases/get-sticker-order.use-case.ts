import { Injectable } from '@nestjs/common'
import type { IDomainUseCase } from '@/shared/types/domain-use-case.type'
import { StickerOrderForbiddenError } from '../errors/sticker-order.errors'
import { requireStickerOrder } from '../helpers/require-sticker-order'
import { StickerOrderRepository } from '../repository/sticker-order.repository'
import type { StickerOrder } from '../types/sticker-order.types'

interface GetStickerOrderInput {
	id: string
	userId: string
}

@Injectable()
export class GetStickerOrderUseCase implements IDomainUseCase<
	GetStickerOrderInput,
	StickerOrder
> {
	constructor(private readonly repository: StickerOrderRepository) {}

	async execute({ id, userId }: GetStickerOrderInput): Promise<StickerOrder> {
		const stickerOrder = await requireStickerOrder(this.repository, id)

		if (stickerOrder.userId !== userId) {
			throw new StickerOrderForbiddenError(id)
		}

		return stickerOrder
	}
}
