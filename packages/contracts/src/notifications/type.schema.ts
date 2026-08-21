import { z } from 'zod'
import { NOTIFICATION_TYPES } from './notifications.const'

export const notificationTypeSchema = z.enum(NOTIFICATION_TYPES, {
	error: 'Type de notification invalide',
})

export type NotificationType = z.output<typeof notificationTypeSchema>
