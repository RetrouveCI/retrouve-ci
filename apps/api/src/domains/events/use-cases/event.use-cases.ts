import { Inject, Injectable } from '@nestjs/common'
import { EventNotFoundError } from '../errors/event.errors'
import type { Event, EventListResponse } from '../models/event.model'
import {
	EVENT_REPOSITORY,
	type EventRepository,
} from '../repository/event.repository'
import type {
	CreateEventData,
	ListEventsFilter,
	UpdateEventData,
} from '../types/event.types'
import {
	validateCreateEvent,
	validateUpdateEvent,
} from '../validators/event.validator'

@Injectable()
export class EventUseCases {
	constructor(
		@Inject(EVENT_REPOSITORY)
		private readonly eventRepository: EventRepository,
	) {}

	async create(data: CreateEventData): Promise<Event> {
		validateCreateEvent(data)

		return this.eventRepository.create(data)
	}

	async getById(id: string): Promise<Event> {
		const event = await this.eventRepository.findById(id)

		if (!event) {
			throw new EventNotFoundError(id)
		}

		return event
	}

	async list(filter: ListEventsFilter): Promise<EventListResponse> {
		return this.eventRepository.list(filter)
	}

	async update(id: string, data: UpdateEventData): Promise<Event> {
		validateUpdateEvent(data)

		await this.getById(id)

		return this.eventRepository.update(id, data)
	}

	async delete(id: string): Promise<void> {
		await this.getById(id)

		await this.eventRepository.delete(id)
	}
}
