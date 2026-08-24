import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
	buildRepository,
	buildStickerOrder,
} from '../../__tests__/sticker-order.fixture'
import type { StickerOrderRepository } from '../../repository/sticker-order.repository'
import type { CreateStickerOrderData } from '../../types/sticker-order.types'
import { CreateStickerOrderUseCase } from '../create-sticker-order.use-case'

const data: CreateStickerOrderData = {
	packId: 'pack-4',
	paymentMethod: 'Orange Money',
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

	/** The price comes from the catalogue: a body cannot set it. */
	it('prices the order from the pack and stores it', async () => {
		const created = buildStickerOrder()
		vi.mocked(repository.create).mockResolvedValue(created)

		const result = await useCase.execute(data)

		expect(repository.create).toHaveBeenCalledWith({
			orderNumber: expect.stringMatching(/^CMD-\d{4}-\d{6}$/),
			packId: 'pack-4',
			packName: 'Starter',
			quantity: 4,
			unitPrice: 1500,
			deliveryFee: 1000,
			total: 2500,
			paymentMethod: 'Orange Money',
			deliveryAddress: 'Cocody Riviera 3, Abidjan',
			deliveryCity: 'Abidjan',
			deliveryNotes: undefined,
			userId: 'user-1',
		})
		expect(result).toEqual(created)
	})

	it('applies a free-delivery coupon', async () => {
		vi.mocked(repository.create).mockResolvedValue(
			buildStickerOrder({ deliveryFee: 0, total: 1500 }),
		)

		await useCase.execute({ ...data, couponCode: 'RETROUVECI' })

		expect(repository.create).toHaveBeenCalledWith(
			expect.objectContaining({ deliveryFee: 0, total: 1500 }),
		)
	})
})
