import { Injectable } from '@nestjs/common'
import { PAYMENT_ON_DELIVERY } from '@app/contracts/sticker-orders'
import type { IDomainUseCase } from '@/shared/types/domain-use-case.type'
import { computeDeliveryFee } from '../helpers/compute-delivery-fee'
import { generateOrderNumber } from '../helpers/generate-order-number'
import { getStickerPack } from '../helpers/get-sticker-pack'
import { StickerOrderRepository } from '../repository/sticker-order.repository'
import type {
	CreateStickerOrderData,
	StickerOrder,
} from '../types/sticker-order.types'

@Injectable()
export class CreateStickerOrderUseCase implements IDomainUseCase<
	CreateStickerOrderData,
	StickerOrder
> {
	constructor(private readonly repository: StickerOrderRepository) {}

	/**
	 * The price comes from the catalogue, never from the body, and so does the
	 * payment method: stickers are paid to the courier.
	 */
	async execute(data: CreateStickerOrderData): Promise<StickerOrder> {
		const pack = getStickerPack(data.packId)
		const deliveryFee = computeDeliveryFee(data.couponCode)

		return this.repository.create({
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
	}
}
