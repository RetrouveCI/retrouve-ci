import { NotFoundError } from '@/shared/errors/domain.error'

export class StickerOrderNotFoundError extends NotFoundError {
	constructor(id: string) {
		super(`Sticker order with id "${id}" not found`)
	}
}
