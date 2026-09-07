import type {
	GenerateQrTokensData,
	ReachChannel,
	ListQrTokensFilterData,
	QrTokenDetailsData,
	QrTokenStatus,
} from '@app/contracts/qr-codes'
import type { Paginated } from '@/shared/utils/pagination.util'

export type {
	GenerateQrTokensData,
	QrTokenDetailsData,
	QrTokenStatus,
	ReachChannel,
}

/** The admin list is unscoped; `listMine` narrows it to the session's user. */
export type ListQrTokensFilter = ListQrTokensFilterData & {
	userId?: string
}

export interface QrTokenPublicView {
	status: QrTokenStatus
	ownerFirstName: string | null
	label: string | null
	linkedObject: string | null
	/** Deliberately a boolean: it says a button may be drawn, never who to call. */
	directContact: boolean
	/** Only when published and still active; `null` also covers « not linked ». */
	lostItem: LinkedLostItem | null
}

/** What `/q/:code` may say about a linked listing: enough to open it, no more. */
export interface LinkedLostItem {
	id: string
	title: string
	ville: string
	photo: string | null
}

/** Read only by the reach use-case: the one shape here carrying a phone number. */
export interface QrTokenOwnerReach {
	status: QrTokenStatus
	directContact: boolean
	label: string | null
	ownerUserId: string | null
	ownerPhoneNumber: string | null
}

export interface QrToken {
	id: string
	code: string
	status: QrTokenStatus
	batch: string | null
	label: string | null
	linkedObject: string | null
	directContact: boolean
	lostItemId: string | null
	userId: string | null
	createdAt: Date
	activatedAt: Date | null
	revokedAt: Date | null
}

export type QrTokenListResponse = Paginated<QrToken>

/**
 * `activated` is counted on the tokens, `delivered` on the orders: a
 * `generated` token carries no owner, so what a visitor holds cannot be
 * counted on the tokens at all.
 */
export interface StickerActivationSummary {
	delivered: number
	activated: number
	pending: number
}
