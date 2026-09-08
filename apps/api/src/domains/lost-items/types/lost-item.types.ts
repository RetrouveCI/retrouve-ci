import type {
	AdminListLostItemsFilterData,
	CreateLostItemData as CreateLostItemContract,
	DocumentType,
	LostItemCategory,
	LostItemType,
	ModerationReason,
	ModerationStatus,
	ResolutionStatus,
	UpdateLostItemData as UpdateLostItemContract,
} from '@app/contracts/lost-items'
import type { Paginated } from '@/shared/utils/pagination.util'

export type {
	DocumentType,
	LostItemCategory,
	LostItemType,
	ModerationReason,
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
 * What a moderation write carries. Hiding without saying why stays possible,
 * and the contract refuses a reason on anything but a removal.
 */
export interface ModerationDecision {
	moderationStatus: ModerationStatus
	moderationReason?: ModerationReason
	moderationReasonNote?: string
}

/** `undefined` leaves the column alone; a `Date` or `null` writes it. */
export type ResolvedAtWrite = Date | null | undefined

/** What the auth panel and the home badge both read, counted not written. */
export interface PublicCounters {
	published: number
	resolvedThisMonth: number
}

/**
 * What a moderation write settled. `becamePublished` is a transition, not a
 * state: publication is the only moment matching runs, so a second publish of
 * an already-published listing must not look for matches again.
 */
export interface ModerationOutcome {
	lostItem: LostItem
	becamePublished: boolean
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
	documentType: DocumentType | null
	documentHolderName: string | null
	documentNumber: string | null
	documentIssuer: string | null
	moderationStatus: ModerationStatus
	moderationReason: ModerationReason | null
	moderationReasonNote: string | null
	resolutionStatus: ResolutionStatus
	resolvedAt: Date | null
	views: number
	contactsCount: number
	userId: string
	createdAt: Date
	updatedAt: Date
}

/**
 * What a public read may carry. A listing is an indexable page: an identity
 * number published next to a holder's name hands over the set an impersonation
 * needs, so the column is written and never served. Each field is typed
 * `never` rather than dropped, so a full `LostItem` is **not** assignable. A
 * cast still walks past that, hence a projection built field by field and a
 * spec on the **serialised** shape.
 */
export type PublicLostItem = Omit<
	LostItem,
	| 'documentNumber'
	| 'moderationReason'
	| 'moderationReasonNote'
	| 'contactWhatsapp'
	| 'userId'
	| 'resolvedAt'
> & {
	documentNumber?: never
	moderationReason?: never
	moderationReasonNote?: never
	/** It used to travel with every card and every detail: any crawler harvested it. */
	contactWhatsapp?: never
	/** Read by neither front, and it links every listing one person posted. */
	userId?: never
	/** Counted by A5 in aggregate; no public screen reads one listing's day. */
	resolvedAt?: never
	contactReachable: boolean
}

export type LostItemListResponse = Paginated<LostItem>
export type PublicLostItemListResponse = Paginated<PublicLostItem>

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
