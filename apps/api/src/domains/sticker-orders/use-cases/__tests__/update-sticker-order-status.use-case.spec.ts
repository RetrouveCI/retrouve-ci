import { beforeEach, describe, expect, it, vi } from 'vitest'
import { formatPrice } from '@app/contracts/sticker-orders'
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

	it.each([
		'pending',
		'processing',
		'shipped',
		'delivered',
		'cancelled',
	] as const)('says nothing when %s was already the status', async status => {
		await transition(status, status)

		expect(createNotification.execute).not.toHaveBeenCalled()
	})

	it('says nothing on the way back to pending', async () => {
		await transition('processing', 'pending')

		expect(createNotification.execute).not.toHaveBeenCalled()
	})

	// Only `delivered` was announced, so a buyer paying on delivery learnt
	// nothing between ordering and the knock.
	describe('the transitions N3 added', () => {
		const notice = () =>
			vi.mocked(createNotification.execute).mock.calls[0]?.[0]

		it('tells the buyer the pack is being prepared', async () => {
			await transition('pending', 'processing', { userId: 'user-7' })

			expect(notice()).toEqual(
				expect.objectContaining({
					type: 'order_processing',
					title: 'Votre commande est en préparation',
					link: '/account/orders',
					userId: 'user-7',
				}),
			)
		})

		// ⚠️ Asserted through `formatPrice`, not against « 11 000 » spelt out:
		// `Intl` separates thousands with a narrow no-break space (R59's cash).
		it('names the cash to have ready when the pack ships', async () => {
			await transition('processing', 'shipped', { total: 11000 })

			expect(notice()).toEqual(
				expect.objectContaining({ type: 'order_shipped' }),
			)
			expect(notice()?.message).toContain(`${formatPrice(11000)} FCFA`)
			expect(notice()?.message).toContain('espèces')
		})

		// Cancelled means no courier is coming — the heaviest transition.
		it('tells the buyer nobody will come when the order is cancelled', async () => {
			await transition('processing', 'cancelled', {
				orderNumber: 'CMD-2026-000042',
			})

			expect(notice()).toEqual(
				expect.objectContaining({
					type: 'order_cancelled',
					link: '/account/orders',
				}),
			)
			expect(notice()?.message).toContain('CMD-2026-000042')
			expect(notice()?.message).toContain('Aucun coursier')
		})

		it.each([
			[1, 'Votre sticker est'],
			[4, 'Vos 4 stickers sont'],
		] as const)('agrees the verb for %i sticker(s)', async (quantity, said) => {
			await transition('pending', 'processing', { quantity })

			expect(notice()?.message).toContain(said)
		})

		// The row is already written: losing the notice must not answer 500.
		it('still moves the order when the notice fails', async () => {
			vi.mocked(createNotification.execute).mockRejectedValue(
				new Error('redis down'),
			)

			await expect(transition('pending', 'shipped')).resolves.toMatchObject({
				status: 'shipped',
			})
		})
	})

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
