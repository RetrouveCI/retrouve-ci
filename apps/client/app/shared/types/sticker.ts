export type StickerStatus = 'generated' | 'activated' | 'revoked'

export interface Sticker {
	id: string
	code: string
	status: StickerStatus
	isActive: boolean
	label: string | null
	linkedObject: string | null
	activatedAt: string | null
}

/**
 * A sticker waiting to be activated carries no owner, so `delivered` is read
 * off the orders and only `activated` off the tokens.
 */
export interface StickerActivationSummary {
	delivered: number
	activated: number
	pending: number
}
