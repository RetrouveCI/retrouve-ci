import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Event } from '@/domains/events/models/event.model'
import { EventUseCases } from '@/domains/events/use-cases/event.use-cases'
import type { CreateEventDto } from '../dto/create-event.dto'
import type { ListEventsQueryDto } from '../dto/list-events.query.dto'
import type { UpdateEventDto } from '../dto/update-event.dto'
import { EventsController } from './events.controller'

function buildEvent(overrides: Partial<Event> = {}): Event {
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

function buildUseCases(): EventUseCases {
	return {
		create: vi.fn(),
		getById: vi.fn(),
		list: vi.fn(),
		update: vi.fn(),
		delete: vi.fn(),
	} as unknown as EventUseCases
}

describe('EventsController', () => {
	let useCases: EventUseCases
	let controller: EventsController

	beforeEach(() => {
		useCases = buildUseCases()
		controller = new EventsController(useCases)
	})

	describe('create', () => {
		it('converts the eventDate string and forwards to the use cases', async () => {
			const dto: CreateEventDto = {
				title: 'Collecte des objets retrouvés',
				description: 'Une journée pour restituer les objets retrouvés',
				location: 'Place de la mairie',
				ville: 'Abidjan',
				eventDate: '2026-02-01',
			}
			const created = buildEvent()
			vi.mocked(useCases.create).mockResolvedValue(created)

			const result = await controller.create(dto)

			expect(useCases.create).toHaveBeenCalledWith({
				...dto,
				eventDate: new Date('2026-02-01'),
			})
			expect(result).toEqual(created)
		})
	})

	describe('list', () => {
		it('forces the published status', async () => {
			const query: ListEventsQueryDto = { page: 1, pageSize: 20 }
			const response = {
				items: [buildEvent({ status: 'published' })],
				total: 1,
				page: 1,
				pageSize: 20,
			}
			vi.mocked(useCases.list).mockResolvedValue(response)

			const result = await controller.list(query)

			expect(useCases.list).toHaveBeenCalledWith({
				...query,
				status: 'published',
			})
			expect(result).toEqual(response)
		})
	})

	describe('listForAdmin', () => {
		it('delegates to the use cases without forcing a status', async () => {
			const query = { page: 1, pageSize: 20, status: 'draft' as const }
			const response = {
				items: [buildEvent({ status: 'draft' })],
				total: 1,
				page: 1,
				pageSize: 20,
			}
			vi.mocked(useCases.list).mockResolvedValue(response)

			const result = await controller.listForAdmin(query)

			expect(useCases.list).toHaveBeenCalledWith(query)
			expect(result).toEqual(response)
		})
	})

	describe('getOne', () => {
		it('delegates to the use cases', async () => {
			const event = buildEvent()
			vi.mocked(useCases.getById).mockResolvedValue(event)

			const result = await controller.getOne('event-1')

			expect(useCases.getById).toHaveBeenCalledWith('event-1')
			expect(result).toEqual(event)
		})
	})

	describe('update', () => {
		it('converts the eventDate string when present', async () => {
			const dto: UpdateEventDto = {
				title: 'Nouveau titre',
				eventDate: '2026-03-01',
			}
			const updated = buildEvent({ title: 'Nouveau titre' })
			vi.mocked(useCases.update).mockResolvedValue(updated)

			const result = await controller.update('event-1', dto)

			expect(useCases.update).toHaveBeenCalledWith('event-1', {
				title: 'Nouveau titre',
				eventDate: new Date('2026-03-01'),
			})
			expect(result).toEqual(updated)
		})

		it('omits eventDate when not provided', async () => {
			const dto: UpdateEventDto = { title: 'Nouveau titre' }
			const updated = buildEvent({ title: 'Nouveau titre' })
			vi.mocked(useCases.update).mockResolvedValue(updated)

			await controller.update('event-1', dto)

			expect(useCases.update).toHaveBeenCalledWith('event-1', {
				title: 'Nouveau titre',
			})
		})
	})

	describe('delete', () => {
		it('delegates to the use cases', async () => {
			vi.mocked(useCases.delete).mockResolvedValue(undefined)

			await controller.delete('event-1')

			expect(useCases.delete).toHaveBeenCalledWith('event-1')
		})
	})
})
