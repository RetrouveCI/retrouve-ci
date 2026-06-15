import type { StickerOrder, OrderStatus } from '@/domain/entities/order'

export interface IOrderRepository {
	getAll(): Promise<StickerOrder[]>
	getById(id: string): Promise<StickerOrder | null>
	updateStatus(id: string, status: OrderStatus): Promise<void>
}
