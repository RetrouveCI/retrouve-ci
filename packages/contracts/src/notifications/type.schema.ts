import { z } from 'zod'
import {
	ADMIN_NOTIFICATION_TYPES,
	NOTIFICATION_AUDIENCES,
	NOTIFICATION_TYPES,
} from './notifications.const'

export const notificationTypeSchema = z.enum(NOTIFICATION_TYPES, {
	error: 'Type de notification invalide',
})

export type NotificationType = z.output<typeof notificationTypeSchema>

export const notificationAudienceSchema = z.enum(NOTIFICATION_AUDIENCES, {
	error: 'Audience de notification invalide',
})

export type NotificationAudience = z.output<typeof notificationAudienceSchema>

/** The audience a type belongs to, so no caller has to remember the pairing. */
export function audienceOf(type: NotificationType): NotificationAudience {
	return (ADMIN_NOTIFICATION_TYPES as readonly string[]).includes(type)
		? 'admin'
		: 'user'
}
