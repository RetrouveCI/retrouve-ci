import type { QrTokenStatus } from '../types/qr-token.types'

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

export interface QrTokenListResponse {
	items: QrToken[]
	total: number
	page: number
	pageSize: number
}
