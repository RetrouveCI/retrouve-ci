import { NotFoundError } from '@/shared/errors/domain.error'

export class EventNotFoundError extends NotFoundError {
	constructor(id: string) {
		super(`Event with id "${id}" not found`)
	}
}
