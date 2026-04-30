export type QRTokenStatus = 'activated' | 'generated' | 'revoked'

export interface QRToken {
	token: string
	status: QRTokenStatus
	batch: string
	createdAt: string
	activatedAt: string | null
	revokedAt: string | null
	userId: number | null
	userName: string | null
	linkedObject: string | null
}
