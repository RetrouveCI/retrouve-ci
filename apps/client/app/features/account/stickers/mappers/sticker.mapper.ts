import type { Sticker } from '@/shared/types/sticker'
import type { QrTokenApiDto } from '../stickers.types'

export function toSticker(dto: QrTokenApiDto): Sticker {
	return {
		id: dto.id,
		code: dto.code,
		status: dto.status,
		isActive: dto.status === 'activated',
		label: dto.label,
		linkedObject: dto.linkedObject,
		activatedAt: dto.activatedAt,
	}
}
