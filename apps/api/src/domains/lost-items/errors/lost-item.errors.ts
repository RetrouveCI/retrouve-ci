import {
	ForbiddenError,
	NotFoundError,
	ValidationError,
} from '@/shared/errors/domain.error'

export class LostItemNotFoundError extends NotFoundError {
	constructor(id: string) {
		super(`Lost item with id "${id}" not found`)
	}
}

export class InvalidLostItemError extends ValidationError {}

export class LostItemForbiddenError extends ForbiddenError {
	constructor(id: string) {
		super(`You are not allowed to modify lost item with id "${id}"`)
	}
}
