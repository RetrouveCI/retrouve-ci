import { Inject, Injectable } from '@nestjs/common'
import { LostItemNotFoundError } from '../errors/lost-item.errors'
import type { LostItem, LostItemListResponse } from '../models/lost-item.model'
import {
	LOST_ITEM_REPOSITORY,
	type LostItemRepository,
} from '../repository/lost-item.repository'
import type {
	CreateLostItemData,
	ListLostItemsFilter,
} from '../types/lost-item.types'
import { validateCreateLostItem } from '../validators/lost-item.validator'

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

	async list(filter: ListLostItemsFilter): Promise<LostItemListResponse> {
		return this.lostItemRepository.list(filter)
	}
}
