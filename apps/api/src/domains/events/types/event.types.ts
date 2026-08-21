import type {
	AdminListEventsFilterData,
	CreateEventData as CreateEventContract,
	EventStatus,
	UpdateEventData as UpdateEventContract,
} from '@app/contracts/events'

export type { EventStatus }

/** The wire carries the date as a string; the domain works on a `Date`. */
export type CreateEventData = Omit<CreateEventContract, 'eventDate'> & {
	eventDate: Date
}

export type UpdateEventData = Omit<UpdateEventContract, 'eventDate'> & {
	eventDate?: Date
}

/** The public list narrows the status to `published`; the admin one is free. */
export type ListEventsFilter = AdminListEventsFilterData
