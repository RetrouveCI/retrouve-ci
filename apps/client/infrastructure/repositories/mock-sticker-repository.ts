import type { IStickerRepository } from '@/domain/repositories/sticker-repository'
import type { Sticker } from '@/domain/entities/sticker'
import { MOCK_USER, MOCK_STICKERS } from '@/infrastructure/mock/data'

class MockStickerRepository implements IStickerRepository {
	private stickers: Map<string, Sticker[]> = new Map([
		[MOCK_USER.id, [...MOCK_STICKERS]],
	])

	async getUserStickers(userId: string): Promise<Sticker[]> {
		return [...(this.stickers.get(userId) ?? [])]
	}

	async activate(
		userId: string,
		code: string,
		label: string,
		linkedObject?: string,
	): Promise<Sticker> {
		const newSticker: Sticker = {
			id: `sticker-${Date.now()}`,
			code,
			label,
			isActive: true,
			activatedAt: new Date().toISOString().split('T')[0],
			linkedObject,
		}
		const current = this.stickers.get(userId) ?? []
		this.stickers.set(userId, [...current, newSticker])
		return newSticker
	}

	async deactivate(userId: string, stickerId: string): Promise<void> {
		const current = this.stickers.get(userId) ?? []
		this.stickers.set(
			userId,
			current.map(s => (s.id === stickerId ? { ...s, isActive: false } : s)),
		)
	}

	async update(
		userId: string,
		stickerId: string,
		updates: Partial<Sticker>,
	): Promise<Sticker> {
		const current = this.stickers.get(userId) ?? []
		let updated: Sticker | undefined
		const next = current.map(s => {
			if (s.id === stickerId) {
				updated = { ...s, ...updates }
				return updated
			}
			return s
		})
		this.stickers.set(userId, next)
		if (!updated) throw new Error(`Sticker ${stickerId} not found`)
		return updated
	}
}

export const stickerRepository: IStickerRepository =
	new MockStickerRepository()
