import { PHOTOS_REFUSED_MESSAGE } from '@app/contracts/lost-items'
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

export class LostItemForbiddenError extends ForbiddenError {
	constructor(id: string) {
		super(`You are not allowed to modify lost item with id "${id}"`)
	}
}

/** The contract's own sentence, since `create` reports this rule through the pipe. */
export class LostItemPhotosRefusedError extends ValidationError {
	constructor() {
		super(PHOTOS_REFUSED_MESSAGE)
	}
}
