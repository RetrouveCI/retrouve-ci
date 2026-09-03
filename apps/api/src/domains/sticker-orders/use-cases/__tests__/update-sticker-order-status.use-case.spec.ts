import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
	buildRepository,
	buildStickerOrder,
} from '../../__tests__/sticker-order.fixture'
import type { StickerOrder } from '../../types/sticker-order.types'
import type { CreateNotificationUseCase } from '@/domains/notifications/use-cases/create-notification.use-case'
import { StickerOrderNotFoundError } from '../../errors/sticker-order.errors'
import type { StickerOrderRepository } from '../../repository/sticker-order.repository'
import { UpdateStickerOrderStatusUseCase } from '../update-sticker-order-status.use-case'

describe('UpdateStickerOrderStatusUseCase', () => {
	let repository: StickerOrderRepository
	let createNotification: CreateNotificationUseCase
	let useCase: UpdateStickerOrderStatusUseCase

	/** Moves the order from `from` to `to` and answers what was written. */
	async function transition(
		from: StickerOrder['status'],
		to: StickerOrder['status'],
		overrides: Partial<StickerOrder> = {},
	) {
		vi.mocked(repository.findById).mockResolvedValue(
			buildStickerOrder({ status: from, ...overrides }),
		)
		vi.mocked(repository.updateStatus).mockResolvedValue(
			buildStickerOrder({ status: to, ...overrides }),
		)

		return useCase.execute({ id: 'order-1', status: to })
	}

	beforeEach(() => {
		repository = buildRepository()
		createNotification = {
			execute: vi.fn().mockResolvedValue(undefined),
		} as unknown as CreateNotificationUseCase
		useCase = new UpdateStickerOrderStatusUseCase(
			repository,
			createNotification,
		)
	})

	it('updates the status when the order exists', async () => {
		const updated = buildStickerOrder({ status: 'shipped' })
		vi.mocked(repository.findById).mockResolvedValue(buildStickerOrder())
		vi.mocked(repository.updateStatus).mockResolvedValue(updated)

		const result = await useCase.execute({ id: 'order-1', status: 'shipped' })

		expect(repository.updateStatus).toHaveBeenCalledWith('order-1', 'shipped')
		expect(result).toEqual(updated)
	})

	it('throws when the order does not exist, without writing', async () => {
		vi.mocked(repository.findById).mockResolvedValue(null)

		await expect(
			useCase.execute({ id: 'missing', status: 'shipped' }),
		).rejects.toThrow(StickerOrderNotFoundError)
		expect(repository.updateStatus).not.toHaveBeenCalled()
	})

	// Told once: the prompt to scan is a standing task the badge carries.
	it('tells the buyer when the pack is delivered', async () => {
		await transition('shipped', 'delivered', { quantity: 8, userId: 'user-7' })

		expect(createNotification.execute).toHaveBeenCalledWith({
			type: 'stickers_delivered',
			title: 'Vos stickers sont arrivés',
			message:
				'8 stickers à activer. Scannez-les un par un, comptez une minute.',
			link: '/scan',
			userId: 'user-7',
		})
	})

	it('says it in the singular for a lone sticker', async () => {
		await transition('shipped', 'delivered', { quantity: 1 })

		expect(createNotification.execute).toHaveBeenCalledWith(
			expect.objectContaining({
				title: 'Votre sticker est arrivé',
				message: 'Scannez-le pour lui donner un nom.',
			}),
		)
	})

	it('says nothing when the order was already delivered', async () => {
		await transition('delivered', 'delivered')

		expect(createNotification.execute).not.toHaveBeenCalled()
	})

	it.each(['pending', 'processing', 'shipped', 'cancelled'] as const)(
		'says nothing on the way to %s',
		async status => {
			await transition('pending', status)

			expect(createNotification.execute).not.toHaveBeenCalled()
		},
	)

	/** An admin action: it checks no ownership, by design. */
	it('updates an order owned by somebody else', async () => {
		const updated = buildStickerOrder({ userId: 'user-9', status: 'delivered' })
		vi.mocked(repository.findById).mockResolvedValue(
			buildStickerOrder({ userId: 'user-9' }),
		)
		vi.mocked(repository.updateStatus).mockResolvedValue(updated)

		expect(
			await useCase.execute({ id: 'order-1', status: 'delivered' }),
		).toEqual(updated)
	})
})
