import {
	StickerOrderSource as PrismaStickerOrderSource,
	StickerOrderStatus as PrismaStickerOrderStatus,
} from '@app/database'
import { describe, expect, it } from 'vitest'
import { STICKER_ORDER_SOURCES } from '@app/contracts/sticker-orders'
import {
	toDomainSource,
	toDomainStatus,
	toDomainStickerOrder,
	toPrismaSource,
	toPrismaStatus,
} from '../sticker-order.mapper'

describe('sticker-order mapper', () => {
	it('maps a Prisma StickerOrder to the domain model', () => {
		const prismaStickerOrder = {
			id: 'order-1',
			orderNumber: 'CMD-2026-000001',
			packId: 'pack-4',
			packName: 'Starter',
			quantity: 4,
			unitPrice: 1500,
			deliveryFee: 1000,
			total: 2500,
			status: PrismaStickerOrderStatus.PENDING,
			source: PrismaStickerOrderSource.HOME,
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
		}

		expect(toDomainStickerOrder(prismaStickerOrder)).toEqual({
			id: 'order-1',
			orderNumber: 'CMD-2026-000001',
			packId: 'pack-4',
			packName: 'Starter',
			quantity: 4,
			unitPrice: 1500,
			deliveryFee: 1000,
			total: 2500,
			status: 'pending',
			source: 'home',
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
		})
	})

	it.each([
		['pending', PrismaStickerOrderStatus.PENDING],
		['processing', PrismaStickerOrderStatus.PROCESSING],
		['shipped', PrismaStickerOrderStatus.SHIPPED],
		['delivered', PrismaStickerOrderStatus.DELIVERED],
		['cancelled', PrismaStickerOrderStatus.CANCELLED],
	] as const)('maps status %s both ways', (domain, prisma) => {
		expect(toPrismaStatus(domain)).toBe(prisma)
		expect(toDomainStatus(prisma)).toBe(domain)
	})
})

describe('the source both sides carry', () => {
	it.each(STICKER_ORDER_SOURCES)('maps %s both ways', source => {
		expect(toDomainSource(toPrismaSource(source))).toBe(source)
	})

	// The same guard the notification types carry, and it catches a typo.
	it('has the same sources on both sides', () => {
		expect(Object.keys(PrismaStickerOrderSource).sort()).toEqual(
			[...STICKER_ORDER_SOURCES].map(value => value.toUpperCase()).sort(),
		)
	})
})
