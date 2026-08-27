import { vi } from 'vitest'
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
		unitPrice: 1500,
		deliveryFee: 1000,
		total: 2500,
		status: 'pending',
		paymentMethod: 'Orange Money',
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
	} as unknown as StickerOrderRepository
}
