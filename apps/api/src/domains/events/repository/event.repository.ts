import type { Event, EventListResponse } from '../models/event.model'
import type {
	CreateEventData,
	ListEventsFilter,
	UpdateEventData,
} from '../types/event.types'

export const EVENT_REPOSITORY = Symbol('EVENT_REPOSITORY')

export interface EventRepository {
	create(data: CreateEventData): Promise<Event>
	findById(id: string): Promise<Event | null>
	list(filter: ListEventsFilter): Promise<EventListResponse>
	update(id: string, data: UpdateEventData): Promise<Event>
	delete(id: string): Promise<void>
}
