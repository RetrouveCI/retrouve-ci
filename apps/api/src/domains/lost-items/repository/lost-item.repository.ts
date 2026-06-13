import type { LostItem, LostItemListResponse } from '../models/lost-item.model'
import type {
	CreateLostItemData,
	ListLostItemsFilter,
	UpdateLostItemData,
} from '../types/lost-item.types'

export const LOST_ITEM_REPOSITORY = Symbol('LOST_ITEM_REPOSITORY')

export interface LostItemRepository {
	create(data: CreateLostItemData): Promise<LostItem>
	findById(id: string): Promise<LostItem | null>
	list(filter: ListLostItemsFilter): Promise<LostItemListResponse>
	update(id: string, data: UpdateLostItemData): Promise<LostItem>
	delete(id: string): Promise<void>
	incrementViews(id: string): Promise<void>
	incrementContacts(id: string): Promise<void>
}
