import { Inject, Injectable } from '@nestjs/common'
import {
	LostItemForbiddenError,
	LostItemNotFoundError,
} from '../errors/lost-item.errors'
import type { LostItem, LostItemListResponse } from '../models/lost-item.model'
import {
	LOST_ITEM_REPOSITORY,
	type LostItemRepository,
} from '../repository/lost-item.repository'
import type {
	CreateLostItemData,
	ListLostItemsFilter,
	UpdateLostItemData,
} from '../types/lost-item.types'
import {
	validateCreateLostItem,
	validateUpdateLostItem,
} from '../validators/lost-item.validator'

@Injectable()
export class LostItemUseCases {
	constructor(
		@Inject(LOST_ITEM_REPOSITORY)
		private readonly lostItemRepository: LostItemRepository,
	) {}

	async create(data: CreateLostItemData): Promise<LostItem> {
		validateCreateLostItem(data)

		return this.lostItemRepository.create(data)
	}

	async getById(id: string): Promise<LostItem> {
		const lostItem = await this.lostItemRepository.findById(id)

		if (!lostItem) {
			throw new LostItemNotFoundError(id)
		}

		return lostItem
	}

	async view(id: string): Promise<LostItem> {
		const lostItem = await this.getById(id)

		await this.lostItemRepository.incrementViews(id)

		return { ...lostItem, views: lostItem.views + 1 }
	}

	async recordContact(id: string): Promise<LostItem> {
		const lostItem = await this.getById(id)

		await this.lostItemRepository.incrementContacts(id)

		return { ...lostItem, contactsCount: lostItem.contactsCount + 1 }
	}

	async list(filter: ListLostItemsFilter): Promise<LostItemListResponse> {
		return this.lostItemRepository.list(filter)
	}

	async listMine(
		userId: string,
		filter: ListLostItemsFilter,
	): Promise<LostItemListResponse> {
		return this.lostItemRepository.list({ ...filter, userId })
	}

	async update(
		id: string,
		userId: string,
		data: UpdateLostItemData,
	): Promise<LostItem> {
		validateUpdateLostItem(data)

		const lostItem = await this.getById(id)

		if (lostItem.userId !== userId) {
			throw new LostItemForbiddenError(id)
		}

		return this.lostItemRepository.update(id, data)
	}

	async delete(id: string, userId: string): Promise<void> {
		const lostItem = await this.getById(id)

		if (lostItem.userId !== userId) {
			throw new LostItemForbiddenError(id)
		}

		await this.lostItemRepository.delete(id)
	}
}
