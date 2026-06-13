import {
	ForbiddenError,
	NotFoundError,
	ValidationError,
} from '@/shared/errors/domain.error'

export class StickerOrderNotFoundError extends NotFoundError {
	constructor(id: string) {
		super(`Sticker order with id "${id}" not found`)
	}
}

export class InvalidStickerOrderError extends ValidationError {}

export class StickerOrderForbiddenError extends ForbiddenError {
	constructor(id: string) {
		super(`You are not allowed to access sticker order with id "${id}"`)
	}
}
