import type { UserSession } from '@thallesp/nestjs-better-auth'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { buildStickerOrder } from '@/domains/sticker-orders/__tests__/sticker-order.fixture'
import type { CreateStickerOrderUseCase } from '@/domains/sticker-orders/use-cases/create-sticker-order.use-case'
import type { GetMyStickerOrdersUseCase } from '@/domains/sticker-orders/use-cases/get-my-sticker-orders.use-case'
import type { GetPaginatedStickerOrdersUseCase } from '@/domains/sticker-orders/use-cases/get-paginated-sticker-orders.use-case'
import type { GetStickerOrderUseCase } from '@/domains/sticker-orders/use-cases/get-sticker-order.use-case'
import type { UpdateStickerOrderStatusUseCase } from '@/domains/sticker-orders/use-cases/update-sticker-order-status.use-case'
import type { Auth } from '@/infrastructures/auth/auth.config'
import { StickerOrdersController } from '../sticker-orders.controller'

const session = { user: { id: 'user-1' } } as UserSession<Auth>

function buildUseCase<TUseCase>(): TUseCase {
	return { execute: vi.fn() } as unknown as TUseCase
}

describe('StickerOrdersController', () => {
	let createStickerOrder: CreateStickerOrderUseCase
	let getStickerOrder: GetStickerOrderUseCase
	let getPaginatedStickerOrders: GetPaginatedStickerOrdersUseCase
	let getMyStickerOrders: GetMyStickerOrdersUseCase
	let updateStickerOrderStatus: UpdateStickerOrderStatusUseCase
	let controller: StickerOrdersController

	beforeEach(() => {
		createStickerOrder = buildUseCase<CreateStickerOrderUseCase>()
		getStickerOrder = buildUseCase<GetStickerOrderUseCase>()
		getPaginatedStickerOrders = buildUseCase<GetPaginatedStickerOrdersUseCase>()
		getMyStickerOrders = buildUseCase<GetMyStickerOrdersUseCase>()
		updateStickerOrderStatus = buildUseCase<UpdateStickerOrderStatusUseCase>()
		controller = new StickerOrdersController(
			createStickerOrder,
			getStickerOrder,
			getPaginatedStickerOrders,
			getMyStickerOrders,
			updateStickerOrderStatus,
		)
	})

	describe('create', () => {
		/** The body never carries the owner: it comes from the session. */
		it('forwards the session user id', async () => {
			const created = buildStickerOrder()
			vi.mocked(createStickerOrder.execute).mockResolvedValue(created)

			const dto = {
				packId: 'pack-4' as const,
				paymentMethod: 'Orange Money',
				deliveryAddress: 'Cocody Riviera 3, Abidjan',
				deliveryCity: 'Abidjan',
			}
			const result = await controller.create(session, dto)

			expect(createStickerOrder.execute).toHaveBeenCalledWith({
				...dto,
				userId: 'user-1',
			})
			expect(result).toEqual(created)
		})
	})

	describe('list', () => {
		it('is restricted to admins', () => {
			expect(Reflect.getMetadata('ROLES', controller.list)).toEqual(['admin'])
		})

		it('delegates the filter unchanged', async () => {
			const response = {
				items: [buildStickerOrder()],
				total: 1,
				page: 1,
				pageSize: 20,
			}
			vi.mocked(getPaginatedStickerOrders.execute).mockResolvedValue(response)

			const filter = { page: 1, pageSize: 20 }

			expect(await controller.list(filter)).toEqual(response)
			expect(getPaginatedStickerOrders.execute).toHaveBeenCalledWith(filter)
		})
	})

	describe('listMine', () => {
		it('passes the session user id alongside the filter', async () => {
			const response = {
				items: [buildStickerOrder({ userId: 'user-1' })],
				total: 1,
				page: 1,
				pageSize: 20,
			}
			vi.mocked(getMyStickerOrders.execute).mockResolvedValue(response)

			const filter = { page: 1, pageSize: 20 }
			const result = await controller.listMine(session, filter)

			expect(getMyStickerOrders.execute).toHaveBeenCalledWith({
				userId: 'user-1',
				filter,
			})
			expect(result).toEqual(response)
		})
	})

	describe('getOne', () => {
		it('passes the session user id alongside the id', async () => {
			const order = buildStickerOrder()
			vi.mocked(getStickerOrder.execute).mockResolvedValue(order)

			const result = await controller.getOne(session, 'order-1')

			expect(getStickerOrder.execute).toHaveBeenCalledWith({
				id: 'order-1',
				userId: 'user-1',
			})
			expect(result).toEqual(order)
		})
	})

	describe('updateStatus', () => {
		it('is restricted to admins', () => {
			expect(Reflect.getMetadata('ROLES', controller.updateStatus)).toEqual([
				'admin',
			])
		})

		it('delegates to the use-case', async () => {
			const updated = buildStickerOrder({ status: 'shipped' })
			vi.mocked(updateStickerOrderStatus.execute).mockResolvedValue(updated)

			const result = await controller.updateStatus('order-1', {
				status: 'shipped',
			})

			expect(updateStickerOrderStatus.execute).toHaveBeenCalledWith({
				id: 'order-1',
				status: 'shipped',
			})
			expect(result).toEqual(updated)
		})
	})
})
