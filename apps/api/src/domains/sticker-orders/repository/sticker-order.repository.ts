import { Injectable } from '@nestjs/common'
import { StickerOrderStatus as PrismaStickerOrderStatus } from '@app/database'
import { PrismaService } from '@/infrastructures/database/prisma.service'
import {
	toDomainStickerOrder,
	toPrismaStatus,
} from '../mappers/sticker-order.mapper'
import { toPaginated, toPrismaPage } from '@/shared/utils/pagination.util'
import type {
	CreateStickerOrderRecord,
	ListStickerOrdersFilter,
	StickerOrder,
	StickerOrderListResponse,
	StickerOrderStatus,
} from '../types/sticker-order.types'

@Injectable()
export class StickerOrderRepository {
	constructor(private readonly prisma: PrismaService) {}

	async create(data: CreateStickerOrderRecord): Promise<StickerOrder> {
		const stickerOrder = await this.prisma.stickerOrder.create({
			data: {
				orderNumber: data.orderNumber,
				packId: data.packId,
				packName: data.packName,
				quantity: data.quantity,
				unitPrice: data.unitPrice,
				deliveryFee: data.deliveryFee,
				total: data.total,
				paymentMethod: data.paymentMethod,
				deliveryAddress: data.deliveryAddress,
				deliveryCity: data.deliveryCity,
				deliveryNotes: data.deliveryNotes ?? null,
				userId: data.userId,
			},
		})

		return toDomainStickerOrder(stickerOrder)
	}

	async findById(id: string): Promise<StickerOrder | null> {
		const stickerOrder = await this.prisma.stickerOrder.findUnique({
			where: { id },
		})

		return stickerOrder ? toDomainStickerOrder(stickerOrder) : null
	}

	/**
	 * How many stickers the visitor actually holds. Only a delivered order has
	 * arrived, so only its quantity counts — a pending pack is not yet a sticker
	 * anybody can stick on anything.
	 */
	async sumDeliveredQuantity(userId: string): Promise<number> {
		const { _sum } = await this.prisma.stickerOrder.aggregate({
			where: { userId, status: PrismaStickerOrderStatus.DELIVERED },
			_sum: { quantity: true },
		})

		return _sum.quantity ?? 0
	}

	async list(
		filter: ListStickerOrdersFilter,
	): Promise<StickerOrderListResponse> {
		const where = {
			...(filter.status && { status: toPrismaStatus(filter.status) }),
			...(filter.userId && { userId: filter.userId }),
		}

		const [items, total] = await Promise.all([
			this.prisma.stickerOrder.findMany({
				where,
				orderBy: { createdAt: 'desc' },
				...toPrismaPage(filter),
			}),
			this.prisma.stickerOrder.count({ where }),
		])

		return toPaginated(items.map(toDomainStickerOrder), total, filter)
	}

	async updateStatus(
		id: string,
		status: StickerOrderStatus,
	): Promise<StickerOrder> {
		const now = new Date()
		const shippedAt =
			status === 'shipped' ? now : status === 'delivered' ? undefined : null
		const deliveredAt = status === 'delivered' ? now : null

		const stickerOrder = await this.prisma.stickerOrder.update({
			where: { id },
			data: {
				status: toPrismaStatus(status),
				...(shippedAt !== undefined && { shippedAt }),
				deliveredAt,
			},
		})

		return toDomainStickerOrder(stickerOrder)
	}
}
