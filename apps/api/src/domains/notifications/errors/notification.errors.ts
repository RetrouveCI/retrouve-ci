import { NotFoundError } from '@/shared/errors/domain.error'

export class NotificationNotFoundError extends NotFoundError {
	constructor(id: string) {
		super(`Notification with id "${id}" not found`)
	}
}
