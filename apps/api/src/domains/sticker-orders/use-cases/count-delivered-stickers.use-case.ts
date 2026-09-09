import { Injectable } from '@nestjs/common'
import type { IDomainUseCase } from '@/shared/types/domain-use-case.type'
import { StickerOrderRepository } from '../repository/sticker-order.repository'

@Injectable()
export class CountDeliveredStickersUseCase implements IDomainUseCase<
	string,
	number
> {
	constructor(private readonly repository: StickerOrderRepository) {}

	/** The caller's own id is the only scope; there is no filter to widen it. */
	async execute(userId: string): Promise<number> {
		return this.repository.sumDeliveredQuantity(userId)
	}
}
