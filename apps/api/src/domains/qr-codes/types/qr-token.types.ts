import type {
	GenerateQrTokensData,
	ListQrTokensFilterData,
	QrTokenDetailsData,
	QrTokenStatus,
} from '@app/contracts/qr-codes'
import type { Paginated } from '@/shared/utils/pagination.util'

export type { GenerateQrTokensData, QrTokenDetailsData, QrTokenStatus }

/** The admin list is unscoped; `listMine` narrows it to the session's user. */
export type ListQrTokensFilter = ListQrTokensFilterData & {
	userId?: string
}

export interface QrTokenPublicView {
	status: QrTokenStatus
	ownerFirstName: string | null
	label: string | null
	linkedObject: string | null
}

export interface QrToken {
	id: string
	code: string
	status: QrTokenStatus
	batch: string | null
	label: string | null
	linkedObject: string | null
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
