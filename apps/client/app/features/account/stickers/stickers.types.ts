import type { StickerStatus } from '@/shared/types/sticker'

export interface QrTokenApiDto {
	id: string
	code: string
	status: StickerStatus
	batch: string | null
	label: string | null
	linkedObject: string | null
	userId: string | null
	createdAt: string
	activatedAt: string | null
	revokedAt: string | null
}

export interface QrTokenListApiResponse {
	items: QrTokenApiDto[]
	total: number
	page: number
	pageSize: number
}
