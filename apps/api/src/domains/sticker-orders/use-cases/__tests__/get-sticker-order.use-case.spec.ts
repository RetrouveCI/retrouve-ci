import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
	buildRepository,
	buildStickerOrder,
} from '../../__tests__/sticker-order.fixture'
import { StickerOrderNotFoundError } from '../../errors/sticker-order.errors'
import type { StickerOrderRepository } from '../../repository/sticker-order.repository'
import type { StickerOrder } from '../../types/sticker-order.types'
import { GetStickerOrderUseCase } from '../get-sticker-order.use-case'

describe('GetStickerOrderUseCase', () => {
	let repository: StickerOrderRepository
	let useCase: GetStickerOrderUseCase

	beforeEach(() => {
		repository = buildRepository()
		useCase = new GetStickerOrderUseCase(repository)
	})

	it('returns the order to its owner', async () => {
		const order = buildStickerOrder({ userId: 'user-1' })
		vi.mocked(repository.findById).mockResolvedValue(order)

		expect(await useCase.execute({ id: 'order-1', userId: 'user-1' })).toEqual(
			order,
		)
	})

	/**
	 * Not forbidden, as `notifications` already had it: a 403 tells whoever
	 * guessed the id that it exists.
	 */
	it("answers not found for somebody else's order", async () => {
		vi.mocked(repository.findById).mockResolvedValue(
			buildStickerOrder({ userId: 'user-1' }),
		)

		await expect(
			useCase.execute({ id: 'order-1', userId: 'user-2' }),
		).rejects.toThrow(StickerOrderNotFoundError)
	})

	// The filter sends `error: exception.name`, so a distinct error class would
	// leak through the 404 the same way the 403 did.
	it('is indistinguishable from an order that never existed', async () => {
		const rejectionOf = async (order: StickerOrder | null) => {
			vi.mocked(repository.findById).mockResolvedValue(order)
			let caught: Error | undefined
			await useCase
				.execute({ id: 'order-1', userId: 'user-2' })
				.catch((error: unknown) => {
					caught = error as Error
				})
			return caught
		}

		const foreign = await rejectionOf(buildStickerOrder({ userId: 'user-1' }))
		const missing = await rejectionOf(null)

		expect(foreign).toBeInstanceOf(StickerOrderNotFoundError)
		expect(foreign?.name).toBe(missing?.name)
		expect(foreign?.message).toBe(missing?.message)
	})

	it('throws when the order does not exist', async () => {
		vi.mocked(repository.findById).mockResolvedValue(null)

		await expect(
			useCase.execute({ id: 'missing', userId: 'user-1' }),
		).rejects.toThrow(StickerOrderNotFoundError)
	})
})
