import { apiFetch } from '@/shared/lib/api-client'
import type { NotificationListApiResponse } from '../notifications.types'

const PAGE_SIZE = 10

export async function getMyNotifications(
	request: Request,
): Promise<NotificationListApiResponse> {
	return apiFetch<NotificationListApiResponse>(
		`/notifications/mine?pageSize=${PAGE_SIZE}`,
		{ headers: { Cookie: request.headers.get('cookie') ?? '' } },
	)
}

export async function getUnreadNotificationsCount(
	request: Request,
): Promise<number> {
	return apiFetch<number>('/notifications/unread-count', {
		headers: { Cookie: request.headers.get('cookie') ?? '' },
	})
}

export async function markNotificationAsRead(
	id: string,
	request: Request,
): Promise<void> {
	await apiFetch(`/notifications/${id}/read`, {
		method: 'PATCH',
		headers: { Cookie: request.headers.get('cookie') ?? '' },
	})
}

export async function markAllNotificationsAsRead(
	request: Request,
): Promise<void> {
	await apiFetch('/notifications/read-all', {
		method: 'PATCH',
		headers: { Cookie: request.headers.get('cookie') ?? '' },
	})
}
