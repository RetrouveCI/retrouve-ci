import type { EventStatus } from '@app/contracts/events'

export type { EventStatus }

export interface Event {
	id: string
	title: string
	description: string
	location: string
	ville: string
	commune: string | null
	eventDate: string
	status: EventStatus
	createdAt: string
	updatedAt: string
}

export interface EventListResponse {
	items: Event[]
	total: number
	page: number
	pageSize: number
}
