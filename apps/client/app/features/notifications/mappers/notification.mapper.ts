import { formatRelativeDate } from '@/shared/lib/format-relative-date'
import type { Notification } from '@/shared/types/notification'
import type { NotificationApiDto } from '../notifications.types'

export function toNotification(dto: NotificationApiDto): Notification {
	return {
		id: dto.id,
		type: dto.type,
		title: dto.title,
		message: dto.message,
		link: dto.link,
		read: dto.read,
		relativeDate: formatRelativeDate(dto.createdAt),
	}
}
