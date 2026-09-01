import type {
	AdminListLostItemsFilterData,
	CreateLostItemData as CreateLostItemContract,
	LostItemCategory,
	LostItemType,
	ModerationStatus,
	ResolutionStatus,
	UpdateLostItemData as UpdateLostItemContract,
} from '@app/contracts/lost-items'
import type { Paginated } from '@/shared/utils/pagination.util'

export type {
	LostItemCategory,
	LostItemType,
	ModerationStatus,
	ResolutionStatus,
}

/** The wire carries the date as a string; the domain works on a `Date`. */
export type CreateLostItemData = Omit<CreateLostItemContract, 'eventDate'> & {
	eventDate: Date
	userId: string
}

export type UpdateLostItemData = Omit<UpdateLostItemContract, 'eventDate'> & {
	eventDate?: Date
}

/**
 * The repository also narrows by owner and by resolution status. Neither is a
 * query parameter: both come from the use-case.
 */
export type ListLostItemsFilter = Omit<
	AdminListLostItemsFilterData,
	'dateFrom' | 'dateTo'
> & {
	dateFrom?: Date
	dateTo?: Date
	resolutionStatus?: ResolutionStatus
	userId?: string
}

/** Matching searches the opposite type; the filter is not a query shape. */
export interface MatchCandidatesFilter {
	type: LostItemType
	category: LostItemCategory
	ville: string
	moderationStatus: ModerationStatus
	resolutionStatus: ResolutionStatus
	limit: number
}

export interface LostItem {
	id: string
	type: LostItemType
	category: LostItemCategory
	title: string
	description: string
	ville: string
	commune: string | null
	eventDate: Date
	contactName: string
	contactWhatsapp: string
	photos: string[]
	moderationStatus: ModerationStatus
	resolutionStatus: ResolutionStatus
	views: number
	contactsCount: number
	userId: string
	createdAt: Date
	updatedAt: Date
}

export type LostItemListResponse = Paginated<LostItem>

/**
 * The two state axes counted over everything one owner has posted. The browser
 * used to work these out from the page it happened to hold, so they were wrong
 * past the first page — and the moderation axis was not countable at all, being
 * filtered out of the list the front reads.
 */
export interface LostItemOwnerSummary {
	total: number
	lifecycle: Record<ResolutionStatus, number>
	moderation: Record<ModerationStatus, number>
}
