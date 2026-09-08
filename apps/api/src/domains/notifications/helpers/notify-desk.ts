import type { Logger } from '@nestjs/common'
import type { CreateNotificationUseCase } from '../use-cases/create-notification.use-case'
import type {
	AdminNotificationType,
	CreateNotificationData,
} from '../types/notification.types'

type DeskNotification = Extract<
	CreateNotificationData,
	{ type: AdminNotificationType }
>

// Tells the desk without risking the write: the row already exists, so a failing
// notice must not answer 500. Logged as an error, since nobody learns otherwise.
export async function notifyDesk(
	createNotification: CreateNotificationUseCase,
	logger: Logger,
	data: DeskNotification,
): Promise<void> {
	try {
		await createNotification.execute(data)
	} catch (error) {
		logger.error(`Desk notification (${data.type}) failed: ${error}`)
	}
}
