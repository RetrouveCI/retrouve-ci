import { NotFoundError, ValidationError } from '@/shared/errors/domain.error'

export class EventNotFoundError extends NotFoundError {
	constructor(id: string) {
		super(`Event with id "${id}" not found`)
	}
}

export class InvalidEventError extends ValidationError {}
