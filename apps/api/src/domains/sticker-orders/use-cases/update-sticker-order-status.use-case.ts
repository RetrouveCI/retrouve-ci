import { Injectable } from '@nestjs/common'
import type { IDomainUseCase } from '@/shared/types/domain-use-case.type'
import { requireStickerOrder } from '../helpers/require-sticker-order'
import { StickerOrderRepository } from '../repository/sticker-order.repository'
import type {
	StickerOrder,
	StickerOrderStatus,
} from '../types/sticker-order.types'

interface UpdateStickerOrderStatusInput {
	id: string
	status: StickerOrderStatus
}

@Injectable()
export class UpdateStickerOrderStatusUseCase
	implements IDomainUseCase<UpdateStickerOrderStatusInput, StickerOrder>
{
	constructor(private readonly repository: StickerOrderRepository) {}

	async execute({
		id,
		status,
	}: UpdateStickerOrderStatusInput): Promise<StickerOrder> {
		await requireStickerOrder(this.repository, id)

		return this.repository.updateStatus(id, status)
	}
}
