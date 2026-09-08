import type { Logger } from '@nestjs/common'
import type { CreateNotificationUseCase } from '../use-cases/create-notification.use-case'
import type {
	AdminNotificationType,
	CreateNotificationData,
	UserNotificationType,
} from '../types/notification.types'

type DeskNotification = Extract<
	CreateNotificationData,
	{ type: AdminNotificationType }
>

type PosterNotification = Extract<
	CreateNotificationData,
	{ type: UserNotificationType }
>

// Notifies without risking the write: the row already exists by the time this
// runs, so a failing notice must not answer 500. Logged as an error, since
// nobody learns otherwise.
async function notify(
	createNotification: CreateNotificationUseCase,
	logger: Logger,
	data: CreateNotificationData,
): Promise<void> {
	try {
		await createNotification.execute(data)
	} catch (error) {
		logger.error(`Notification (${data.type}) failed: ${error}`)
	}
}

// Two façades over one body, rather than two bodies to keep in step. Each keeps
// its own narrow type, so the compiler still refuses a visitor's notice to the
// desk and a desk notice to a visitor.
export function notifyDesk(
	createNotification: CreateNotificationUseCase,
	logger: Logger,
	data: DeskNotification,
): Promise<void> {
	return notify(createNotification, logger, data)
}

export function notifyUser(
	createNotification: CreateNotificationUseCase,
	logger: Logger,
	data: PosterNotification,
): Promise<void> {
	return notify(createNotification, logger, data)
}
