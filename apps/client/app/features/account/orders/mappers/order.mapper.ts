import type { Order, StickerOrderApiDto } from '../orders.types'

export function toOrder(dto: StickerOrderApiDto): Order {
	return {
		id: dto.id,
		orderNumber: dto.orderNumber,
		date: dto.createdAt,
		pack: { name: dto.packName, quantity: dto.quantity, price: dto.unitPrice },
		deliveryFee: dto.deliveryFee,
		total: dto.total,
		status: dto.status,
		paymentMethod: dto.paymentMethod,
		deliveryAddress: `${dto.deliveryAddress}, ${dto.deliveryCity}`,
		trackingNumber: dto.trackingNumber ?? undefined,
	}
}
