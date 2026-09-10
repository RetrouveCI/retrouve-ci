import type {
	DocumentType,
	LostItem,
	ModerationReason,
	LostItemType,
	LostItemCategory,
	LostItemStatus,
	ModerationStatus,
} from './lost-item'

export interface LostItemFilters {
	type?: LostItemType | 'all'
	category?: LostItemCategory | string | 'all'
	ville?: string
	commune?: string
	search?: string
	dateFrom?: Date
	dateTo?: Date
}

export interface LostItemDetail extends LostItem {
	contact: { name: string }
	contactReachable: boolean
}

export interface LostItemBaseApiDto {
	id: string
	type: LostItemType
	category: LostItemCategory
	title: string
	description: string
	ville: string
	commune: string | null
	eventDate: string
	contactName: string
	photos: string[]
	documentType: DocumentType | null
	documentHolderName: string | null
	documentIssuer: string | null
	moderationStatus: ModerationStatus
	resolutionStatus: LostItemStatus
	views: number
	contactsCount: number
	/** Filed by the RetrouveCI team rather than by a visitor. */
	official: boolean
	createdAt: string
}

/** A public read: a boolean where the poster's line used to travel. */
export interface LostItemApiDto extends LostItemBaseApiDto {
	contactReachable: boolean
}

/**
 * What the session-gated reads add. Both are declared here and nowhere else, so
 * a screen fed by a public read cannot reach for either.
 */
export interface MyLostItemApiDto extends LostItemBaseApiDto {
	contactWhatsapp: string
	documentNumber: string | null
	moderationReason: ModerationReason | null
	moderationReasonNote: string | null
}

/**
 * The two state axes counted over every listing the visitor owns, not over the
 * page the browser happens to hold. Unfiltered on purpose: a pill counter says
 * how many there are in that bucket, and a moderation exception must not be
 * hidden by a search.
 */
export interface MyLostItemsSummaryApiResponse {
	total: number
	lifecycle: Record<LostItemStatus, number>
	moderation: Record<ModerationStatus, number>
}

interface PaginatedApiResponse<TItem> {
	items: TItem[]
	total: number
	page: number
	pageSize: number
}

// Two shapes rather than one extending the other: the owner's read carries the
// number where the public one carries a boolean, so neither widens the other.
export type LostItemListApiResponse = PaginatedApiResponse<LostItemApiDto>
export type MyLostItemListApiResponse = PaginatedApiResponse<MyLostItemApiDto>

/** `GET /lost-items/:id/matches` — a scored candidate of the opposite type. */
export interface MatchCandidateApiDto {
	lostItem: LostItemApiDto
	score: number
}
