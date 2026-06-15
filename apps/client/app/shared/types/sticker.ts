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
