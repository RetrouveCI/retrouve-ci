import { Injectable } from '@nestjs/common'
import type { IDomainUseCase } from '@/shared/types/domain-use-case.type'
import { requireStickerOrder } from '../helpers/require-sticker-order'
import { StickerOrderRepository } from '../repository/sticker-order.repository'
import type { StickerOrder } from '../types/sticker-order.types'

/**
 * The desk reads any order. `GetStickerOrderUseCase` answers its buyer alone,
 * administrators included, which left the backoffice unable to open one.
 */
@Injectable()
export class GetStickerOrderForDeskUseCase implements IDomainUseCase<
	string,
	StickerOrder
> {
	constructor(private readonly repository: StickerOrderRepository) {}

	execute(id: string): Promise<StickerOrder> {
		return requireStickerOrder(this.repository, id)
	}
}
