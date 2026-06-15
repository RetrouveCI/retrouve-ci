import type { LostItem, LostItemListResponse } from '../models/lost-item.model'
import type {
	CreateLostItemData,
	ListLostItemsFilter,
	LostItemCategory,
	LostItemType,
	ModerationStatus,
	ResolutionStatus,
	UpdateLostItemData,
} from '../types/lost-item.types'

export const LOST_ITEM_REPOSITORY = Symbol('LOST_ITEM_REPOSITORY')

export interface MatchCandidatesFilter {
	type: LostItemType
	category: LostItemCategory
	ville: string
	moderationStatus: ModerationStatus
	resolutionStatus: ResolutionStatus
	limit: number
}

export interface LostItemRepository {
	create(data: CreateLostItemData): Promise<LostItem>
	findById(id: string): Promise<LostItem | null>
	list(filter: ListLostItemsFilter): Promise<LostItemListResponse>
	findMatchCandidates(filter: MatchCandidatesFilter): Promise<LostItem[]>
	update(id: string, data: UpdateLostItemData): Promise<LostItem>
	updateModerationStatus(
		id: string,
		moderationStatus: ModerationStatus,
	): Promise<LostItem>
	delete(id: string): Promise<void>
	incrementViews(id: string): Promise<void>
	incrementContacts(id: string): Promise<void>
}
