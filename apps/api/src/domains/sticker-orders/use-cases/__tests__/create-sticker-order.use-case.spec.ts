import { beforeEach, describe, expect, it, vi } from 'vitest'
import { PAYMENT_ON_DELIVERY } from '@app/contracts/sticker-orders'
import {
	buildRepository,
	buildStickerOrder,
} from '../../__tests__/sticker-order.fixture'
import type { StickerOrderRepository } from '../../repository/sticker-order.repository'
import type { CreateStickerOrderData } from '../../types/sticker-order.types'
import { MAX_OPEN_STICKER_ORDERS } from '../../constants'
import { TooManyOpenStickerOrdersError } from '../../errors/sticker-order.errors'
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

	// The ceiling is on what one account holds at once, not on how fast it
	// orders: an open order is unpaid exposure.
	describe('the open-order ceiling', () => {
		it.each([
			[0, true],
			[MAX_OPEN_STICKER_ORDERS - 1, true],
			[MAX_OPEN_STICKER_ORDERS, false],
			[MAX_OPEN_STICKER_ORDERS + 1, false],
		])('with %i open orders, accepts=%s', async (open, accepted) => {
			vi.mocked(repository.countOpenOrders).mockResolvedValue(open)
			vi.mocked(repository.create).mockResolvedValue(buildStickerOrder())

			const attempt = useCase.execute(data)

			if (accepted) {
				await expect(attempt).resolves.toBeDefined()
			} else {
				await expect(attempt).rejects.toBeInstanceOf(
					TooManyOpenStickerOrdersError,
				)
			}
		})

		it('counts the orders of the ordering account, and no other', async () => {
			vi.mocked(repository.create).mockResolvedValue(buildStickerOrder())

			await useCase.execute(data)

			expect(repository.countOpenOrders).toHaveBeenCalledWith('user-1')
		})

		// A refusal must not write the row it refused.
		it('writes nothing once it refuses', async () => {
			vi.mocked(repository.countOpenOrders).mockResolvedValue(
				MAX_OPEN_STICKER_ORDERS,
			)

			await expect(useCase.execute(data)).rejects.toThrow()
			expect(repository.create).not.toHaveBeenCalled()
		})

		// No field, so the front renders it with `FormRootError`: the refusal is
		// about the account's orders and about none of the form's inputs.
		it('names no field, since no input is at fault', async () => {
			vi.mocked(repository.countOpenOrders).mockResolvedValue(
				MAX_OPEN_STICKER_ORDERS,
			)

			const thrown: unknown = await useCase
				.execute(data)
				.catch((error: unknown) => error)

			expect((thrown as TooManyOpenStickerOrdersError).field).toBeUndefined()
		})
	})
})
