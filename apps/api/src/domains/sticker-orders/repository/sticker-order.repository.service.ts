import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/infrastructure/database/prisma.service'
import {
	toDomainStickerOrder,
	toPrismaStatus,
} from '../mappers/sticker-order.mapper'
import type {
	StickerOrder,
	StickerOrderListResponse,
} from '../models/sticker-order.model'
import type {
	ListStickerOrdersFilter,
	StickerOrderStatus,
} from '../types/sticker-order.types'
import type {
	CreateStickerOrderRecord,
	StickerOrderRepository,
} from './sticker-order.repository'

@Injectable()
export class StickerOrderRepositoryService implements StickerOrderRepository {
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
				skip: (filter.page - 1) * filter.pageSize,
				take: filter.pageSize,
			}),
			this.prisma.stickerOrder.count({ where }),
		])

		return {
			items: items.map(toDomainStickerOrder),
			total,
			page: filter.page,
			pageSize: filter.pageSize,
		}
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
