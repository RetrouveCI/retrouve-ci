import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
	StickerOrderForbiddenError,
	StickerOrderNotFoundError,
} from '../errors/sticker-order.errors'
import type { StickerOrder } from '../models/sticker-order.model'
import type { StickerOrderRepository } from '../repository/sticker-order.repository'
import type { CreateStickerOrderData } from '../types/sticker-order.types'
import { StickerOrderUseCases } from './sticker-order.use-cases'

function buildStickerOrder(
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

function buildRepository(): StickerOrderRepository {
	return {
		create: vi.fn(),
		findById: vi.fn(),
		list: vi.fn(),
		updateStatus: vi.fn(),
	}
}

describe('StickerOrderUseCases', () => {
	let repository: StickerOrderRepository
	let useCases: StickerOrderUseCases

	beforeEach(() => {
		repository = buildRepository()
		useCases = new StickerOrderUseCases(repository)
	})

	describe('create', () => {
		const data: CreateStickerOrderData = {
			packId: 'pack-4',
			paymentMethod: 'Orange Money',
			deliveryAddress: 'Cocody Riviera 3, Abidjan',
			deliveryCity: 'Abidjan',
			userId: 'user-1',
		}

		it('computes pricing from the pack and creates the order', async () => {
			const created = buildStickerOrder()
			vi.mocked(repository.create).mockResolvedValue(created)

			const result = await useCases.create(data)

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
			const created = buildStickerOrder({ deliveryFee: 0, total: 1500 })
			vi.mocked(repository.create).mockResolvedValue(created)

			await useCases.create({ ...data, couponCode: 'RETROUVECI' })

			expect(repository.create).toHaveBeenCalledWith(
				expect.objectContaining({ deliveryFee: 0, total: 1500 }),
			)
		})

		it('throws when the pack id is unknown', async () => {
			await expect(
				useCases.create({ ...data, packId: 'pack-unknown' }),
			).rejects.toThrow()
			expect(repository.create).not.toHaveBeenCalled()
		})
	})

	describe('getById', () => {
		it('returns the sticker order when found', async () => {
			const stickerOrder = buildStickerOrder()
			vi.mocked(repository.findById).mockResolvedValue(stickerOrder)

			const result = await useCases.getById('order-1')

			expect(result).toEqual(stickerOrder)
		})

		it('throws StickerOrderNotFoundError when not found', async () => {
			vi.mocked(repository.findById).mockResolvedValue(null)

			await expect(useCases.getById('missing')).rejects.toThrow(
				StickerOrderNotFoundError,
			)
		})
	})

	describe('getOne', () => {
		it('returns the sticker order when owned by the user', async () => {
			const stickerOrder = buildStickerOrder({ userId: 'user-1' })
			vi.mocked(repository.findById).mockResolvedValue(stickerOrder)

			const result = await useCases.getOne('order-1', 'user-1')

			expect(result).toEqual(stickerOrder)
		})

		it('throws StickerOrderForbiddenError when not owned by the user', async () => {
			const stickerOrder = buildStickerOrder({ userId: 'user-1' })
			vi.mocked(repository.findById).mockResolvedValue(stickerOrder)

			await expect(useCases.getOne('order-1', 'user-2')).rejects.toThrow(
				StickerOrderForbiddenError,
			)
		})
	})

	describe('list', () => {
		it('delegates to the repository', async () => {
			const response = {
				items: [buildStickerOrder()],
				total: 1,
				page: 1,
				pageSize: 20,
			}
			vi.mocked(repository.list).mockResolvedValue(response)

			const filter = { page: 1, pageSize: 20 }
			const result = await useCases.list(filter)

			expect(repository.list).toHaveBeenCalledWith(filter)
			expect(result).toEqual(response)
		})
	})

	describe('listMine', () => {
		it('delegates to the repository with the user id injected', async () => {
			const response = {
				items: [buildStickerOrder({ userId: 'user-1' })],
				total: 1,
				page: 1,
				pageSize: 20,
			}
			vi.mocked(repository.list).mockResolvedValue(response)

			const filter = { page: 1, pageSize: 20 }
			const result = await useCases.listMine('user-1', filter)

			expect(repository.list).toHaveBeenCalledWith({
				...filter,
				userId: 'user-1',
			})
			expect(result).toEqual(response)
		})
	})

	describe('updateStatus', () => {
		it('updates the status when the order exists', async () => {
			const stickerOrder = buildStickerOrder()
			const updated = buildStickerOrder({ status: 'shipped' })
			vi.mocked(repository.findById).mockResolvedValue(stickerOrder)
			vi.mocked(repository.updateStatus).mockResolvedValue(updated)

			const result = await useCases.updateStatus('order-1', 'shipped')

			expect(repository.updateStatus).toHaveBeenCalledWith('order-1', 'shipped')
			expect(result).toEqual(updated)
		})

		it('throws StickerOrderNotFoundError when not found', async () => {
			vi.mocked(repository.findById).mockResolvedValue(null)

			await expect(useCases.updateStatus('missing', 'shipped')).rejects.toThrow(
				StickerOrderNotFoundError,
			)
			expect(repository.updateStatus).not.toHaveBeenCalled()
		})
	})
})
