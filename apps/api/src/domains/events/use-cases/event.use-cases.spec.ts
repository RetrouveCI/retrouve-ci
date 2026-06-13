import { beforeEach, describe, expect, it, vi } from 'vitest'
import { EventNotFoundError } from '../errors/event.errors'
import type { Event } from '../models/event.model'
import type { EventRepository } from '../repository/event.repository'
import type { CreateEventData } from '../types/event.types'
import { EventUseCases } from './event.use-cases'

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

function buildRepository(): EventRepository {
	return {
		create: vi.fn(),
		findById: vi.fn(),
		list: vi.fn(),
		update: vi.fn(),
		delete: vi.fn(),
	}
}

describe('EventUseCases', () => {
	let repository: EventRepository
	let useCases: EventUseCases

	beforeEach(() => {
		repository = buildRepository()
		useCases = new EventUseCases(repository)
	})

	describe('create', () => {
		const data: CreateEventData = {
			title: 'Collecte des objets retrouvés',
			description: 'Une journée pour restituer les objets retrouvés',
			location: 'Place de la mairie',
			ville: 'Abidjan',
			eventDate: new Date('2026-02-01'),
		}

		it('creates an event when data is valid', async () => {
			const created = buildEvent()
			vi.mocked(repository.create).mockResolvedValue(created)

			const result = await useCases.create(data)

			expect(repository.create).toHaveBeenCalledWith(data)
			expect(result).toEqual(created)
		})

		it('throws when the data is invalid', async () => {
			await expect(
				useCases.create({ ...data, description: 'Court' }),
			).rejects.toThrow()
			expect(repository.create).not.toHaveBeenCalled()
		})
	})

	describe('getById', () => {
		it('returns the event when found', async () => {
			const event = buildEvent()
			vi.mocked(repository.findById).mockResolvedValue(event)

			const result = await useCases.getById('event-1')

			expect(result).toEqual(event)
		})

		it('throws EventNotFoundError when the event does not exist', async () => {
			vi.mocked(repository.findById).mockResolvedValue(null)

			await expect(useCases.getById('missing')).rejects.toThrow(
				EventNotFoundError,
			)
		})
	})

	describe('list', () => {
		it('delegates to the repository', async () => {
			const response = {
				items: [buildEvent()],
				total: 1,
				page: 1,
				pageSize: 20,
			}
			vi.mocked(repository.list).mockResolvedValue(response)

			const filter = { page: 1, pageSize: 20 }
			const result = await useCases.list(filter)

			expect(repository.list).toHaveBeenCalledWith(filter)
			expect(result).toEqual(response)
		})
	})

	describe('update', () => {
		it('updates the event when it exists', async () => {
			const event = buildEvent()
			const updated = buildEvent({ title: 'Nouveau titre' })

			vi.mocked(repository.findById).mockResolvedValue(event)
			vi.mocked(repository.update).mockResolvedValue(updated)

			const result = await useCases.update('event-1', { title: 'Nouveau titre' })

			expect(repository.update).toHaveBeenCalledWith('event-1', {
				title: 'Nouveau titre',
			})
			expect(result).toEqual(updated)
		})

		it('throws when the update data is invalid', async () => {
			await expect(
				useCases.update('event-1', { description: 'Court' }),
			).rejects.toThrow()
			expect(repository.findById).not.toHaveBeenCalled()
		})

		it('throws EventNotFoundError when the event does not exist', async () => {
			vi.mocked(repository.findById).mockResolvedValue(null)

			await expect(
				useCases.update('missing', { title: 'Nouveau titre' }),
			).rejects.toThrow(EventNotFoundError)
		})
	})

	describe('delete', () => {
		it('deletes the event when it exists', async () => {
			const event = buildEvent()
			vi.mocked(repository.findById).mockResolvedValue(event)

			await useCases.delete('event-1')

			expect(repository.delete).toHaveBeenCalledWith('event-1')
		})

		it('throws EventNotFoundError when the event does not exist', async () => {
			vi.mocked(repository.findById).mockResolvedValue(null)

			await expect(useCases.delete('missing')).rejects.toThrow(
				EventNotFoundError,
			)
			expect(repository.delete).not.toHaveBeenCalled()
		})
	})
})
