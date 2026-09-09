import { apiFetch } from '@/shared/utils/api-fetch'
import type {
	Notification,
	NotificationListResponse,
} from '../types/notifications.types'

export async function listNotifications(
	params: { read?: boolean; page?: number; pageSize?: number },
	request: Request,
): Promise<NotificationListResponse> {
	const query = new URLSearchParams({
		page: String(params.page ?? 1),
		pageSize: String(params.pageSize ?? 50),
	})
	if (params.read !== undefined) query.set('read', String(params.read))

	return apiFetch<NotificationListResponse>(
		`/notifications/mine?${query.toString()}`,
		{
			request,
		},
	)
}

export async function getUnreadCount(request: Request): Promise<number> {
	return apiFetch<number>('/notifications/unread-count', {
		request,
	})
}

/** A bare number, as `/notifications/unread-count` answers one. */
export async function getPushSubscriptionCount(
	request: Request,
): Promise<number> {
	return apiFetch<number>('/stats/push-subscriptions', { request })
}

export async function markAsRead(
	id: string,
	request: Request,
): Promise<Notification> {
	return apiFetch<Notification>(`/notifications/${id}/read`, {
		method: 'PATCH',
		request,
	})
}

export async function markAllAsRead(request: Request): Promise<void> {
	return apiFetch<void>('/notifications/read-all', {
		method: 'PATCH',
		request,
	})
}
