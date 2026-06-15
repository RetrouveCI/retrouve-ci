export type QrTokenStatus = 'generated' | 'activated' | 'revoked'

export interface QrToken {
	id: string
	code: string
	status: QrTokenStatus
	batch: string | null
	label: string | null
	linkedObject: string | null
	userId: string | null
	createdAt: string
	activatedAt: string | null
	revokedAt: string | null
}

export interface QrTokenListResponse {
	items: QrToken[]
	total: number
	page: number
	pageSize: number
}
