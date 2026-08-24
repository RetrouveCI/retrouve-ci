import { vi } from 'vitest'
import type { EventRepository } from '../repository/event.repository'
import type { Event } from '../types/event.types'

export function buildEvent(overrides: Partial<Event> = {}): Event {
	return {
		id: 'event-1',
		title: 'Collecte des objets retrouvés',
		description: 'Une journée pour restituer les objets retrouvés',
		location: 'Place de la mairie',
		ville: 'Abidjan',
		commune: 'Cocody',
		eventDate: new Date('2026-02-01'),
		status: 'draft',
		createdAt: new Date('2026-01-01'),
		updatedAt: new Date('2026-01-01'),
		...overrides,
	}
}

/** The repository is a concrete class, so a double is a partial cast. */
export function buildRepository(): EventRepository {
	return {
		create: vi.fn(),
		findById: vi.fn(),
		list: vi.fn(),
		update: vi.fn(),
		delete: vi.fn(),
	} as unknown as EventRepository
}
