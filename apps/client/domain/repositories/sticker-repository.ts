import type { Sticker } from '@/domain/entities/sticker'

export interface IStickerRepository {
	getUserStickers(userId: string): Promise<Sticker[]>
	activate(
		userId: string,
		code: string,
		label: string,
		linkedObject?: string,
	): Promise<Sticker>
	deactivate(userId: string, stickerId: string): Promise<void>
	update(
		userId: string,
		stickerId: string,
		updates: Partial<Sticker>,
	): Promise<Sticker>
}
