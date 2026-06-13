import {
	EventStatus as PrismaEventStatus,
	type Event as PrismaEvent,
} from '@retrouve-ci/database'
import { describe, expect, it } from 'vitest'
import { toDomainEvent, toDomainStatus, toPrismaStatus } from './event.mapper'

const prismaEvent: PrismaEvent = {
	id: 'event-1',
	title: 'Collecte des objets retrouvés',
	description: 'Une journée pour restituer les objets retrouvés à Cocody',
	location: 'Place de la mairie',
	ville: 'Abidjan',
	commune: 'Cocody',
	eventDate: new Date('2026-02-01'),
	status: PrismaEventStatus.DRAFT,
	createdAt: new Date('2026-01-01'),
	updatedAt: new Date('2026-01-02'),
}

describe('toDomainEvent', () => {
	it('maps a Prisma event to the domain model', () => {
		expect(toDomainEvent(prismaEvent)).toEqual({
			id: 'event-1',
			title: 'Collecte des objets retrouvés',
			description: 'Une journée pour restituer les objets retrouvés à Cocody',
			location: 'Place de la mairie',
			ville: 'Abidjan',
			commune: 'Cocody',
			eventDate: new Date('2026-02-01'),
			status: 'draft',
			createdAt: new Date('2026-01-01'),
			updatedAt: new Date('2026-01-02'),
		})
	})
})

describe('status conversions', () => {
	it('converts between domain and Prisma statuses', () => {
		expect(toPrismaStatus('draft')).toBe(PrismaEventStatus.DRAFT)
		expect(toPrismaStatus('published')).toBe(PrismaEventStatus.PUBLISHED)
		expect(toPrismaStatus('cancelled')).toBe(PrismaEventStatus.CANCELLED)
		expect(toDomainStatus(PrismaEventStatus.DRAFT)).toBe('draft')
		expect(toDomainStatus(PrismaEventStatus.PUBLISHED)).toBe('published')
		expect(toDomainStatus(PrismaEventStatus.CANCELLED)).toBe('cancelled')
	})
})
