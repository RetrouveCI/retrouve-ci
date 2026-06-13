export type EventStatus = 'draft' | 'published' | 'cancelled'

export interface CreateEventData {
	title: string
	description: string
	location: string
	ville: string
	commune?: string
	eventDate: Date
}

export interface UpdateEventData {
	title?: string
	description?: string
	location?: string
	ville?: string
	commune?: string
	eventDate?: Date
	status?: EventStatus
}

export interface ListEventsFilter {
	status?: EventStatus
	page: number
	pageSize: number
}
