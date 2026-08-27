import { ForbiddenError, NotFoundError } from '@/shared/errors/domain.error'

export class LostItemNotFoundError extends NotFoundError {
	constructor(id: string) {
		super(`Lost item with id "${id}" not found`)
	}
}

export class LostItemForbiddenError extends ForbiddenError {
	constructor(id: string) {
		super(`You are not allowed to modify lost item with id "${id}"`)
	}
}
