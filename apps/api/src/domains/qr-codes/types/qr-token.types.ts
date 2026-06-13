export type QrTokenStatus = 'generated' | 'activated' | 'revoked'

export interface GenerateQrTokensData {
	count: number
	batch?: string
}

export interface ActivateQrTokenData {
	label?: string
	linkedObject?: string
}

export interface ListQrTokensFilter {
	status?: QrTokenStatus
	userId?: string
	page: number
	pageSize: number
}
