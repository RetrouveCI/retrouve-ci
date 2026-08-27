import { beforeEach, describe, expect, it, vi } from 'vitest'
import { PAYMENT_ON_DELIVERY } from '@app/contracts/sticker-orders'
import {
	buildRepository,
	buildStickerOrder,
} from '../../__tests__/sticker-order.fixture'
import type { StickerOrderRepository } from '../../repository/sticker-order.repository'
import type { CreateStickerOrderData } from '../../types/sticker-order.types'
import { CreateStickerOrderUseCase } from '../create-sticker-order.use-case'

const data: CreateStickerOrderData = {
	packId: 'pack-4',
	deliveryAddress: 'Cocody Riviera 3, Abidjan',
	deliveryCity: 'Abidjan',
	userId: 'user-1',
}

describe('CreateStickerOrderUseCase', () => {
	let repository: StickerOrderRepository
	let useCase: CreateStickerOrderUseCase

	beforeEach(() => {
		repository = buildRepository()
		useCase = new CreateStickerOrderUseCase(repository)
	})

	/** The price and the payment method come from the code, not from a body. */
	it('prices the order from the pack and stores it', async () => {
		const created = buildStickerOrder()
		vi.mocked(repository.create).mockResolvedValue(created)

		const result = await useCase.execute(data)

		expect(repository.create).toHaveBeenCalledWith({
			orderNumber: expect.stringMatching(/^CMD-\d{4}-\d{6}$/),
			packId: 'pack-4',
			packName: 'Starter',
			quantity: 4,
			unitPrice: 2000,
			deliveryFee: 1000,
			total: 3000,
			paymentMethod: PAYMENT_ON_DELIVERY,
			deliveryAddress: 'Cocody Riviera 3, Abidjan',
			deliveryCity: 'Abidjan',
			deliveryNotes: undefined,
			userId: 'user-1',
		})
		expect(result).toEqual(created)
	})

	it('applies a free-delivery coupon', async () => {
		vi.mocked(repository.create).mockResolvedValue(
			buildStickerOrder({ deliveryFee: 0, total: 2000 }),
		)

		await useCase.execute({ ...data, couponCode: 'RETROUVECI' })

		expect(repository.create).toHaveBeenCalledWith(
			expect.objectContaining({ deliveryFee: 0, total: 2000 }),
		)
	})
})
