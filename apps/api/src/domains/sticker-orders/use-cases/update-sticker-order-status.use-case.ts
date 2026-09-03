import { Injectable, Logger } from '@nestjs/common'
import { CreateNotificationUseCase } from '@/domains/notifications/use-cases/create-notification.use-case'
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
export class UpdateStickerOrderStatusUseCase implements IDomainUseCase<
	UpdateStickerOrderStatusInput,
	StickerOrder
> {
	private readonly logger = new Logger(UpdateStickerOrderStatusUseCase.name)

	constructor(
		private readonly repository: StickerOrderRepository,
		private readonly createNotificationUseCase: CreateNotificationUseCase,
	) {}

	async execute({
		id,
		status,
	}: UpdateStickerOrderStatusInput): Promise<StickerOrder> {
		const before = await requireStickerOrder(this.repository, id)
		const order = await this.repository.updateStatus(id, status)

		// On the transition alone: a backoffice that saves a delivered order
		// again must not tell its buyer twice that the pack has arrived.
		if (status === 'delivered' && before.status !== 'delivered') {
			await this.notifyDelivery(order)
		}

		return order
	}

	private async notifyDelivery(order: StickerOrder): Promise<void> {
		const isSingle = order.quantity === 1

		await this.createNotificationUseCase.execute({
			type: 'stickers_delivered',
			title: isSingle
				? 'Votre sticker est arrivé'
				: 'Vos stickers sont arrivés',
			message: isSingle
				? 'Scannez-le pour lui donner un nom.'
				: `${order.quantity} stickers à activer. Scannez-les un par un, comptez une minute.`,
			link: '/scan',
			userId: order.userId,
		})

		this.logger.log(`Delivery notified for sticker order ${order.id}`)
	}
}
