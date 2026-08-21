import { ForbiddenError, NotFoundError } from '@/shared/errors/domain.error'

export class StickerOrderNotFoundError extends NotFoundError {
	constructor(id: string) {
		super(`Sticker order with id "${id}" not found`)
	}
}

export class StickerOrderForbiddenError extends ForbiddenError {
	constructor(id: string) {
		super(`You are not allowed to access sticker order with id "${id}"`)
	}
}
