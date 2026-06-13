import { Inject, Injectable } from '@nestjs/common'
import { computeDeliveryFee } from '../helpers/compute-delivery-fee'
import { generateOrderNumber } from '../helpers/generate-order-number'
import { getStickerPack } from '../helpers/get-sticker-pack'
import {
	StickerOrderForbiddenError,
	StickerOrderNotFoundError,
} from '../errors/sticker-order.errors'
import type {
	StickerOrder,
	StickerOrderListResponse,
} from '../models/sticker-order.model'
import {
	STICKER_ORDER_REPOSITORY,
	type StickerOrderRepository,
} from '../repository/sticker-order.repository'
import type {
	CreateStickerOrderData,
	ListStickerOrdersFilter,
	StickerOrderStatus,
} from '../types/sticker-order.types'
import { validateCreateStickerOrder } from '../validators/sticker-order.validator'

@Injectable()
export class StickerOrderUseCases {
	constructor(
		@Inject(STICKER_ORDER_REPOSITORY)
		private readonly stickerOrderRepository: StickerOrderRepository,
	) {}

	async create(data: CreateStickerOrderData): Promise<StickerOrder> {
		validateCreateStickerOrder(data)

		// validateCreateStickerOrder guarantees the pack exists
		const pack = getStickerPack(data.packId)!
		const deliveryFee = computeDeliveryFee(data.couponCode)
		const total = pack.price + deliveryFee

		return this.stickerOrderRepository.create({
			orderNumber: generateOrderNumber(),
			packId: data.packId,
			packName: pack.name,
			quantity: pack.quantity,
			unitPrice: pack.price,
			deliveryFee,
			total,
			paymentMethod: data.paymentMethod,
			deliveryAddress: data.deliveryAddress,
			deliveryCity: data.deliveryCity,
			deliveryNotes: data.deliveryNotes,
			userId: data.userId,
		})
	}

	async getById(id: string): Promise<StickerOrder> {
		const stickerOrder = await this.stickerOrderRepository.findById(id)

		if (!stickerOrder) {
			throw new StickerOrderNotFoundError(id)
		}

		return stickerOrder
	}

	async getOne(id: string, userId: string): Promise<StickerOrder> {
		const stickerOrder = await this.getById(id)

		if (stickerOrder.userId !== userId) {
			throw new StickerOrderForbiddenError(id)
		}

		return stickerOrder
	}

	async list(filter: ListStickerOrdersFilter): Promise<StickerOrderListResponse> {
		return this.stickerOrderRepository.list(filter)
	}

	async listMine(
		userId: string,
		filter: ListStickerOrdersFilter,
	): Promise<StickerOrderListResponse> {
		return this.stickerOrderRepository.list({ ...filter, userId })
	}

	async updateStatus(
		id: string,
		status: StickerOrderStatus,
	): Promise<StickerOrder> {
		await this.getById(id)

		return this.stickerOrderRepository.updateStatus(id, status)
	}
}
