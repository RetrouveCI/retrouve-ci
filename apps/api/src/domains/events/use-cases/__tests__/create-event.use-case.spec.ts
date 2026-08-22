import { beforeEach, describe, expect, it, vi } from 'vitest'
import { buildEvent, buildRepository } from '../../__tests__/event.fixture'
import type { EventRepository } from '../../repository/event.repository'
import { CreateEventUseCase } from '../create-event.use-case'

describe('CreateEventUseCase', () => {
	let repository: EventRepository
	let useCase: CreateEventUseCase

	beforeEach(() => {
		repository = buildRepository()
		useCase = new CreateEventUseCase(repository)
	})

	it('hands the data to the repository and returns the event', async () => {
		const created = buildEvent()
		vi.mocked(repository.create).mockResolvedValue(created)

		const data = {
			title: 'Collecte des objets retrouvés',
			description: 'Une journée pour restituer les objets retrouvés',
			location: 'Place de la mairie',
			ville: 'Abidjan',
			eventDate: new Date('2026-02-01'),
		}

		expect(await useCase.execute(data)).toEqual(created)
		expect(repository.create).toHaveBeenCalledWith(data)
	})

	// The controller converts the wire string; the domain only ever sees a Date.
	it('takes the event date as a Date, not a string', async () => {
		vi.mocked(repository.create).mockResolvedValue(buildEvent())

		await useCase.execute({
			title: 'T',
			description: 'D',
			location: 'L',
			ville: 'Abidjan',
			eventDate: new Date('2026-02-01'),
		})

		const [call] = vi.mocked(repository.create).mock.calls
		expect(call?.[0]?.eventDate).toBeInstanceOf(Date)
	})
})
