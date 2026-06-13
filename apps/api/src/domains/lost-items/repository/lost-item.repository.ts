import type {
	LostItem,
	LostItemListResponse,
} from '../models/lost-item.model'
import type {
	CreateLostItemData,
	ListLostItemsFilter,
} from '../types/lost-item.types'

export const LOST_ITEM_REPOSITORY = Symbol('LOST_ITEM_REPOSITORY')

export interface LostItemRepository {
	create(data: CreateLostItemData): Promise<LostItem>
	findById(id: string): Promise<LostItem | null>
	list(filter: ListLostItemsFilter): Promise<LostItemListResponse>
}
