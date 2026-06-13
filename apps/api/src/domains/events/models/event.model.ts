import type { EventStatus } from '../types/event.types'

export interface Event {
	id: string
	title: string
	description: string
	location: string
	ville: string
	commune: string | null
	eventDate: Date
	status: EventStatus
	createdAt: Date
	updatedAt: Date
}

export interface EventListResponse {
	items: Event[]
	total: number
	page: number
	pageSize: number
}
