import { vi } from 'vitest'
import { PAYMENT_ON_DELIVERY } from '@app/contracts/sticker-orders'
import type { StickerOrderRepository } from '../repository/sticker-order.repository'
import type { StickerOrder } from '../types/sticker-order.types'

export function buildStickerOrder(
	overrides: Partial<StickerOrder> = {},
): StickerOrder {
	return {
		id: 'order-1',
		orderNumber: 'CMD-2026-000001',
		packId: 'pack-4',
		packName: 'Starter',
		quantity: 4,
		unitPrice: 2000,
		deliveryFee: 1000,
		total: 3000,
		status: 'pending',
		paymentMethod: PAYMENT_ON_DELIVERY,
		deliveryAddress: 'Cocody Riviera 3, Abidjan',
		deliveryCity: 'Abidjan',
		deliveryNotes: null,
		trackingNumber: null,
		userId: 'user-1',
		createdAt: new Date('2026-01-01'),
		updatedAt: new Date('2026-01-01'),
		shippedAt: null,
		deliveredAt: null,
		...overrides,
	}
}

/** The repository is a concrete class, so a double is a partial cast. */
export function buildRepository(): StickerOrderRepository {
	return {
		create: vi.fn(),
		findById: vi.fn(),
		list: vi.fn(),
		updateStatus: vi.fn(),
		sumDeliveredQuantity: vi.fn(),
	} as unknown as StickerOrderRepository
}
