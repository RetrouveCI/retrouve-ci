import { apiFetch } from '@/shared/lib/api-client'
import type { Notification, NotificationListResponse } from '../notifications.types'

export async function listNotifications(
	params: { read?: boolean; page?: number; pageSize?: number },
	request: Request,
): Promise<NotificationListResponse> {
	const query = new URLSearchParams({
		page: String(params.page ?? 1),
		pageSize: String(params.pageSize ?? 50),
	})
	if (params.read !== undefined) query.set('read', String(params.read))

	return apiFetch<NotificationListResponse>(`/notifications/mine?${query.toString()}`, {
		headers: { Cookie: request.headers.get('cookie') ?? '' },
	})
}

export async function getUnreadCount(request: Request): Promise<{ count: number }> {
	return apiFetch<{ count: number }>('/notifications/unread-count', {
		headers: { Cookie: request.headers.get('cookie') ?? '' },
	})
}

export async function markAsRead(id: string, request: Request): Promise<Notification> {
	return apiFetch<Notification>(`/notifications/${id}/read`, {
		method: 'PATCH',
		headers: { Cookie: request.headers.get('cookie') ?? '' },
	})
}

export async function markAllAsRead(request: Request): Promise<void> {
	return apiFetch<void>('/notifications/read-all', {
		method: 'PATCH',
		headers: { Cookie: request.headers.get('cookie') ?? '' },
	})
}
