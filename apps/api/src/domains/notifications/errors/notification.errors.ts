import { ForbiddenError, NotFoundError } from '@/shared/errors/domain.error'

export class NotificationNotFoundError extends NotFoundError {
	constructor(id: string) {
		super(`Notification with id "${id}" not found`)
	}
}

export class DeskNotificationsForbiddenError extends ForbiddenError {
	constructor() {
		super('Only an administrator reads the desk notifications')
	}
}
