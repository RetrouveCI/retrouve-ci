import { Injectable, Logger } from '@nestjs/common'
import { PAYMENT_ON_DELIVERY } from '@app/contracts/sticker-orders'
import type { IDomainUseCase } from '@/shared/types/domain-use-case.type'
import { computeDeliveryFee } from '../helpers/compute-delivery-fee'
import { generateOrderNumber } from '../helpers/generate-order-number'
import { getStickerPack } from '../helpers/get-sticker-pack'
import { StickerOrderRepository } from '../repository/sticker-order.repository'
import { CreateNotificationUseCase } from '@/domains/notifications/use-cases/create-notification.use-case'
import { notifyDesk } from '@/domains/notifications/helpers/notify-desk'
import { MAX_OPEN_STICKER_ORDERS } from '../constants'
import { TooManyOpenStickerOrdersError } from '../errors/sticker-order.errors'
import type {
	CreateStickerOrderData,
	StickerOrder,
} from '../types/sticker-order.types'

@Injectable()
export class CreateStickerOrderUseCase implements IDomainUseCase<
	CreateStickerOrderData,
	StickerOrder
> {
	private readonly logger = new Logger(CreateStickerOrderUseCase.name)

	constructor(
		private readonly repository: StickerOrderRepository,
		private readonly createNotification: CreateNotificationUseCase,
	) {}

	/**
	 * The price comes from the catalogue, never from the body, and so does the
	 * payment method: stickers are paid to the courier.
	 */
	async execute(data: CreateStickerOrderData): Promise<StickerOrder> {
		await this.requireRoomForAnotherOrder(data.userId)

		const pack = getStickerPack(data.packId)
		const deliveryFee = computeDeliveryFee(data.couponCode)

		const order = await this.repository.create({
			orderNumber: generateOrderNumber(),
			packId: data.packId,
			packName: pack.name,
			quantity: pack.quantity,
			unitPrice: pack.price,
			deliveryFee,
			total: pack.price + deliveryFee,
			paymentMethod: PAYMENT_ON_DELIVERY,
			deliveryAddress: data.deliveryAddress,
			deliveryCity: data.deliveryCity,
			deliveryNotes: data.deliveryNotes,
			userId: data.userId,
		})

		// Paid to the courier, so an order commits a delivery with cash expected
		// on arrival: nobody was told one had come in.
		await notifyDesk(this.createNotification, this.logger, {
			type: 'order_placed',
			title: 'Nouvelle commande de stickers',
			message: `${order.packName} — ${order.quantity} stickers à livrer à ${order.deliveryCity}, payés à la livraison.`,
			link: '/orders?status=pending',
		})

		return order
	}

	// ⚠️ Count-then-create is not atomic: bounding the exposure is the point, not
	// sequencing it. The address bucket holds the burst.
	private async requireRoomForAnotherOrder(userId: string): Promise<void> {
		const open = await this.repository.countOpenOrders(userId)

		if (open >= MAX_OPEN_STICKER_ORDERS) {
			throw new TooManyOpenStickerOrdersError()
		}
	}
}
