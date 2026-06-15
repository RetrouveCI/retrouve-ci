import { NotFoundError } from '@/shared/errors/domain.error'

export class ContactMessageNotFoundError extends NotFoundError {
	constructor(id: string) {
		super(`Contact message with id "${id}" not found`)
	}
}
