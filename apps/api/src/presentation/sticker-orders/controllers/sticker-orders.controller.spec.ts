import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { StickerOrderUseCases } from '@/domains/sticker-orders/use-cases/sticker-order.use-cases'
import { StickerOrdersController } from './sticker-orders.controller'

function buildUseCases(): StickerOrderUseCases {
	return {
		create: vi.fn(),
		getById: vi.fn(),
		getOne: vi.fn(),
		list: vi.fn(),
		listMine: vi.fn(),
		updateStatus: vi.fn(),
	} as unknown as StickerOrderUseCases
}

const session = { user: { id: 'user-1' } } as Parameters<
	StickerOrdersController['listMine']
>[0]

describe('StickerOrdersController', () => {
	let useCases: StickerOrderUseCases
	let controller: StickerOrdersController

	beforeEach(() => {
		useCases = buildUseCases()
		controller = new StickerOrdersController(useCases)
	})

	describe('create', () => {
		it('delegates to create with the session user id', async () => {
			const order = { id: 'order-1' }
			vi.mocked(useCases.create).mockResolvedValue(order as never)

			const dto = {
				packId: 'pack-4',
				paymentMethod: 'Orange Money',
				deliveryAddress: 'Cocody Riviera 3, Abidjan',
				deliveryCity: 'Abidjan',
			}

			const result = await controller.create(session, dto)

			expect(useCases.create).toHaveBeenCalledWith({
				...dto,
				userId: 'user-1',
			})
			expect(result).toEqual(order)
		})
	})

	describe('list', () => {
		it('delegates to list', async () => {
			const response = { items: [], total: 0, page: 1, pageSize: 20 }
			vi.mocked(useCases.list).mockResolvedValue(response as never)

			const result = await controller.list({ page: 1, pageSize: 20 })

			expect(useCases.list).toHaveBeenCalledWith({ page: 1, pageSize: 20 })
			expect(result).toEqual(response)
		})
	})

	describe('listMine', () => {
		it('delegates to listMine with the session user id', async () => {
			const response = { items: [], total: 0, page: 1, pageSize: 20 }
			vi.mocked(useCases.listMine).mockResolvedValue(response as never)

			const result = await controller.listMine(session, {
				page: 1,
				pageSize: 20,
			})

			expect(useCases.listMine).toHaveBeenCalledWith('user-1', {
				page: 1,
				pageSize: 20,
			})
			expect(result).toEqual(response)
		})
	})

	describe('getOne', () => {
		it('delegates to getOne with the session user id', async () => {
			const order = { id: 'order-1' }
			vi.mocked(useCases.getOne).mockResolvedValue(order as never)

			const result = await controller.getOne(session, 'order-1')

			expect(useCases.getOne).toHaveBeenCalledWith('order-1', 'user-1')
			expect(result).toEqual(order)
		})
	})

	describe('updateStatus', () => {
		it('delegates to updateStatus', async () => {
			const order = { id: 'order-1', status: 'shipped' }
			vi.mocked(useCases.updateStatus).mockResolvedValue(order as never)

			const result = await controller.updateStatus('order-1', {
				status: 'shipped',
			})

			expect(useCases.updateStatus).toHaveBeenCalledWith('order-1', 'shipped')
			expect(result).toEqual(order)
		})
	})
})
