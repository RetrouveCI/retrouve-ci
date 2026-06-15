import { apiFetch } from '@/shared/lib/api-client'
import type {
	Event,
	EventListResponse,
	EventStatus,
} from '../events.types'

export async function listEvents(
	params: { status?: EventStatus; page?: number; pageSize?: number },
	request: Request,
): Promise<EventListResponse> {
	const query = new URLSearchParams({
		page: String(params.page ?? 1),
		pageSize: String(params.pageSize ?? 50),
	})
	if (params.status) query.set('status', params.status)

	return apiFetch<EventListResponse>(`/events/admin?${query.toString()}`, {
		headers: { Cookie: request.headers.get('cookie') ?? '' },
	})
}

export async function createEvent(
	body: {
		title: string
		description: string
		location: string
		ville: string
		commune?: string
		eventDate: string
	},
	request: Request,
): Promise<Event> {
	return apiFetch<Event>('/events', {
		method: 'POST',
		body: JSON.stringify(body),
		headers: { Cookie: request.headers.get('cookie') ?? '' },
	})
}

export async function updateEvent(
	id: string,
	body: Partial<{
		title: string
		description: string
		location: string
		ville: string
		commune: string
		eventDate: string
		status: EventStatus
	}>,
	request: Request,
): Promise<Event> {
	return apiFetch<Event>(`/events/${id}`, {
		method: 'PATCH',
		body: JSON.stringify(body),
		headers: { Cookie: request.headers.get('cookie') ?? '' },
	})
}

export async function deleteEvent(
	id: string,
	request: Request,
): Promise<void> {
	return apiFetch<void>(`/events/${id}`, {
		method: 'DELETE',
		headers: { Cookie: request.headers.get('cookie') ?? '' },
	})
}
