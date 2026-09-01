import type { Order, StickerOrderApiDto } from '../types/orders.types'

export function toOrder(dto: StickerOrderApiDto): Order {
	return {
		id: dto.id,
		orderNumber: dto.orderNumber,
		date: dto.createdAt,
		pack: {
			id: dto.packId,
			name: dto.packName,
			quantity: dto.quantity,
			price: dto.unitPrice,
		},
		deliveryFee: dto.deliveryFee,
		total: dto.total,
		status: dto.status,
		paymentMethod: dto.paymentMethod,
		deliveryAddress: `${dto.deliveryAddress}, ${dto.deliveryCity}`,
		deliveryNotes: dto.deliveryNotes ?? undefined,
		trackingNumber: dto.trackingNumber ?? undefined,
	}
}
