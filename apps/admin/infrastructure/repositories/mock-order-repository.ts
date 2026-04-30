import type { IOrderRepository } from '@/domain/repositories/order-repository'
import type { StickerOrder, OrderStatus } from '@/domain/entities/order'
import { MOCK_STICKER_ORDERS } from '@/infrastructure/mock/data'

class MockOrderRepository implements IOrderRepository {
	private orders: StickerOrder[] = [...MOCK_STICKER_ORDERS]

	async getAll(): Promise<StickerOrder[]> {
		return [...this.orders]
	}

	async getById(id: string): Promise<StickerOrder | null> {
		return this.orders.find(o => o.id === id) ?? null
	}

	async updateStatus(id: string, status: OrderStatus): Promise<void> {
		const now = new Date().toISOString()
		this.orders = this.orders.map(o => {
			if (o.id !== id) return o
			return {
				...o,
				status,
				updatedAt: now,
				shippedAt: status === 'shipped' ? now : o.shippedAt,
				deliveredAt: status === 'delivered' ? now : o.deliveredAt,
			}
		})
	}
}

export const orderRepository: IOrderRepository = new MockOrderRepository()
