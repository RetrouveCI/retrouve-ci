import { beforeEach, describe, expect, it, vi } from 'vitest'
import type {
	CreateEventData,
	ListEventsFilterData,
	UpdateEventData,
} from '@app/contracts/events'
import { buildEvent } from '@/domains/events/__tests__/event.fixture'
import type { CreateEventUseCase } from '@/domains/events/use-cases/create-event.use-case'
import type { DeleteEventUseCase } from '@/domains/events/use-cases/delete-event.use-case'
import type { GetEventByIdUseCase } from '@/domains/events/use-cases/get-event-by-id.use-case'
import type { GetPaginatedEventsUseCase } from '@/domains/events/use-cases/get-paginated-events.use-case'
import type { UpdateEventUseCase } from '@/domains/events/use-cases/update-event.use-case'
import { EventsController } from '../events.controller'

function buildUseCase<T>(): T {
	return { execute: vi.fn() } as unknown as T
}

describe('EventsController', () => {
	let createEvent: CreateEventUseCase
	let getPaginatedEvents: GetPaginatedEventsUseCase
	let getEventById: GetEventByIdUseCase
	let updateEvent: UpdateEventUseCase
	let deleteEvent: DeleteEventUseCase
	let controller: EventsController

	beforeEach(() => {
		createEvent = buildUseCase<CreateEventUseCase>()
		getPaginatedEvents = buildUseCase<GetPaginatedEventsUseCase>()
		getEventById = buildUseCase<GetEventByIdUseCase>()
		updateEvent = buildUseCase<UpdateEventUseCase>()
		deleteEvent = buildUseCase<DeleteEventUseCase>()
		controller = new EventsController(
			createEvent,
			getPaginatedEvents,
			getEventById,
			updateEvent,
			deleteEvent,
		)
	})

	describe('create', () => {
		it('converts the eventDate string and forwards to the use cases', async () => {
			const data: CreateEventData = {
				title: 'Collecte des objets retrouvés',
				description: 'Une journée pour restituer les objets retrouvés',
				location: 'Place de la mairie',
				ville: 'Abidjan',
				eventDate: '2026-02-01',
			}
			const created = buildEvent()
			vi.mocked(createEvent.execute).mockResolvedValue(created)

			const result = await controller.create(data)

			expect(createEvent.execute).toHaveBeenCalledWith({
				...data,
				eventDate: new Date('2026-02-01'),
			})
			expect(result).toEqual(created)
		})
	})

	describe('list', () => {
		it('forces the published status', async () => {
			const query: ListEventsFilterData = { page: 1, pageSize: 20 }
			const response = {
				items: [buildEvent({ status: 'published' })],
				total: 1,
				page: 1,
				pageSize: 20,
			}
			vi.mocked(getPaginatedEvents.execute).mockResolvedValue(response)

			const result = await controller.list(query)

			expect(getPaginatedEvents.execute).toHaveBeenCalledWith({
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
			vi.mocked(getPaginatedEvents.execute).mockResolvedValue(response)

			const result = await controller.listForAdmin(query)

			expect(getPaginatedEvents.execute).toHaveBeenCalledWith(query)
			expect(result).toEqual(response)
		})
	})

	describe('getOne', () => {
		it('delegates to the use cases', async () => {
			const event = buildEvent()
			vi.mocked(getEventById.execute).mockResolvedValue(event)

			const result = await controller.getOne('event-1')

			expect(getEventById.execute).toHaveBeenCalledWith('event-1')
			expect(result).toEqual(event)
		})
	})

	describe('update', () => {
		it('converts the eventDate string when present', async () => {
			const data: UpdateEventData = {
				title: 'Nouveau titre',
				eventDate: '2026-03-01',
			}
			const updated = buildEvent({ title: 'Nouveau titre' })
			vi.mocked(updateEvent.execute).mockResolvedValue(updated)

			const result = await controller.update('event-1', data)

			expect(updateEvent.execute).toHaveBeenCalledWith({
				id: 'event-1',
				data: {
					title: 'Nouveau titre',
					eventDate: new Date('2026-03-01'),
				},
			})
			expect(result).toEqual(updated)
		})

		it('omits eventDate when not provided', async () => {
			const data: UpdateEventData = { title: 'Nouveau titre' }
			const updated = buildEvent({ title: 'Nouveau titre' })
			vi.mocked(updateEvent.execute).mockResolvedValue(updated)

			await controller.update('event-1', data)

			expect(updateEvent.execute).toHaveBeenCalledWith({
				id: 'event-1',
				data: { title: 'Nouveau titre' },
			})
		})
	})

	describe('delete', () => {
		it('delegates to the use cases', async () => {
			vi.mocked(deleteEvent.execute).mockResolvedValue(undefined)

			await controller.delete('event-1')

			expect(deleteEvent.execute).toHaveBeenCalledWith('event-1')
		})
	})
})
