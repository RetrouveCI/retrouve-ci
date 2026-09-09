import { Injectable } from '@nestjs/common'
import { CountDeliveredStickersUseCase } from '@/domains/sticker-orders/use-cases/count-delivered-stickers.use-case'
import type { IDomainUseCase } from '@/shared/types/domain-use-case.type'
import { QrTokenRepository } from '../repository/qr-token.repository'
import type { StickerActivationSummary } from '../types/qr-token.types'

@Injectable()
export class GetMyStickerSummaryUseCase implements IDomainUseCase<
	string,
	StickerActivationSummary
> {
	constructor(
		private readonly repository: QrTokenRepository,
		private readonly countDeliveredStickers: CountDeliveredStickersUseCase,
	) {}

	/**
	 * Subtracted here rather than by each caller, and floored: a sticker
	 * activated outside an order of one's own — a gift, a backoffice reissue —
	 * would make the bar read « 3 sur 0 ».
	 */
	async execute(userId: string): Promise<StickerActivationSummary> {
		const [delivered, activated] = await Promise.all([
			this.countDeliveredStickers.execute(userId),
			this.repository.countActivatedByOwner(userId),
		])

		return {
			delivered: Math.max(delivered, activated),
			activated,
			pending: Math.max(delivered - activated, 0),
		}
	}
}
