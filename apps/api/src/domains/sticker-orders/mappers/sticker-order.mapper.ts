import {
	StickerOrderSource as PrismaStickerOrderSource,
	StickerOrderStatus as PrismaStickerOrderStatus,
	type StickerOrder as PrismaStickerOrder,
} from '@app/database'

import type { StickerOrder } from '../types/sticker-order.types'
import type {
	StickerOrderSource,
	StickerOrderStatus,
} from '../types/sticker-order.types'

export function toDomainStickerOrder(
	stickerOrder: PrismaStickerOrder,
): StickerOrder {
	return {
		id: stickerOrder.id,
		orderNumber: stickerOrder.orderNumber,
		packId: stickerOrder.packId,
		packName: stickerOrder.packName,
		quantity: stickerOrder.quantity,
		unitPrice: stickerOrder.unitPrice,
		deliveryFee: stickerOrder.deliveryFee,
		total: stickerOrder.total,
		status: toDomainStatus(stickerOrder.status),
		paymentMethod: stickerOrder.paymentMethod,
		source: toDomainSource(stickerOrder.source),
		deliveryAddress: stickerOrder.deliveryAddress,
		deliveryCity: stickerOrder.deliveryCity,
		deliveryNotes: stickerOrder.deliveryNotes,
		trackingNumber: stickerOrder.trackingNumber,
		userId: stickerOrder.userId,
		createdAt: stickerOrder.createdAt,
		updatedAt: stickerOrder.updatedAt,
		shippedAt: stickerOrder.shippedAt,
		deliveredAt: stickerOrder.deliveredAt,
	}
}

export function toPrismaSource(
	source: StickerOrderSource,
): PrismaStickerOrderSource {
	switch (source) {
		case 'home':
			return PrismaStickerOrderSource.HOME
		case 'stickers_page':
			return PrismaStickerOrderSource.STICKERS_PAGE
		case 'account':
			return PrismaStickerOrderSource.ACCOUNT
		case 'direct':
			return PrismaStickerOrderSource.DIRECT
	}
}

export function toDomainSource(
	source: PrismaStickerOrderSource,
): StickerOrderSource {
	switch (source) {
		case PrismaStickerOrderSource.HOME:
			return 'home'
		case PrismaStickerOrderSource.STICKERS_PAGE:
			return 'stickers_page'
		case PrismaStickerOrderSource.ACCOUNT:
			return 'account'
		case PrismaStickerOrderSource.DIRECT:
			return 'direct'
	}
}

export function toPrismaStatus(
	status: StickerOrderStatus,
): PrismaStickerOrderStatus {
	switch (status) {
		case 'pending':
			return PrismaStickerOrderStatus.PENDING
		case 'processing':
			return PrismaStickerOrderStatus.PROCESSING
		case 'shipped':
			return PrismaStickerOrderStatus.SHIPPED
		case 'delivered':
			return PrismaStickerOrderStatus.DELIVERED
		case 'cancelled':
			return PrismaStickerOrderStatus.CANCELLED
	}
}

export function toDomainStatus(
	status: PrismaStickerOrderStatus,
): StickerOrderStatus {
	switch (status) {
		case PrismaStickerOrderStatus.PENDING:
			return 'pending'
		case PrismaStickerOrderStatus.PROCESSING:
			return 'processing'
		case PrismaStickerOrderStatus.SHIPPED:
			return 'shipped'
		case PrismaStickerOrderStatus.DELIVERED:
			return 'delivered'
		case PrismaStickerOrderStatus.CANCELLED:
			return 'cancelled'
	}
}
