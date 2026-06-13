import { NotFoundError, ValidationError } from '@/shared/errors/domain.error'

export class LostItemNotFoundError extends NotFoundError {
	constructor(id: string) {
		super(`Lost item with id "${id}" not found`)
	}
}

export class InvalidLostItemError extends ValidationError {}
