import { apiFetch } from '@/shared/utils/api-fetch'
import type { NotificationListApiResponse } from '../types/notifications.types'

const PAGE_SIZE = 10

export async function getMyNotifications(
	request: Request,
): Promise<NotificationListApiResponse> {
	return apiFetch<NotificationListApiResponse>(
		`/notifications/mine?pageSize=${PAGE_SIZE}`,
		{ request },
	)
}

export async function getUnreadNotificationsCount(
	request: Request,
): Promise<number> {
	return apiFetch<number>('/notifications/unread-count', {
		request,
	})
}

export async function markNotificationAsRead(
	id: string,
	request: Request,
): Promise<void> {
	await apiFetch(`/notifications/${id}/read`, {
		method: 'PATCH',
		request,
	})
}

export async function markAllNotificationsAsRead(
	request: Request,
): Promise<void> {
	await apiFetch('/notifications/read-all', {
		method: 'PATCH',
		request,
	})
}
