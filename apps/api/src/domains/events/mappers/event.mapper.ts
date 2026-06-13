import {
	EventStatus as PrismaEventStatus,
	type Event as PrismaEvent,
} from '@retrouve-ci/database'

import type { Event } from '../models/event.model'
import type { EventStatus } from '../types/event.types'

export function toDomainEvent(event: PrismaEvent): Event {
	return {
		id: event.id,
		title: event.title,
		description: event.description,
		location: event.location,
		ville: event.ville,
		commune: event.commune,
		eventDate: event.eventDate,
		status: toDomainStatus(event.status),
		createdAt: event.createdAt,
		updatedAt: event.updatedAt,
	}
}

export function toPrismaStatus(status: EventStatus): PrismaEventStatus {
	switch (status) {
		case 'draft':
			return PrismaEventStatus.DRAFT
		case 'published':
			return PrismaEventStatus.PUBLISHED
		case 'cancelled':
			return PrismaEventStatus.CANCELLED
	}
}

export function toDomainStatus(status: PrismaEventStatus): EventStatus {
	switch (status) {
		case PrismaEventStatus.DRAFT:
			return 'draft'
		case PrismaEventStatus.PUBLISHED:
			return 'published'
		case PrismaEventStatus.CANCELLED:
			return 'cancelled'
	}
}
