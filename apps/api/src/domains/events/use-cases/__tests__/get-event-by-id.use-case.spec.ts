import { beforeEach, describe, expect, it, vi } from 'vitest'
import { buildEvent, buildRepository } from '../../__tests__/event.fixture'
import { EventNotFoundError } from '../../errors/event.errors'
import type { EventRepository } from '../../repository/event.repository'
import { GetEventByIdUseCase } from '../get-event-by-id.use-case'

describe('GetEventByIdUseCase', () => {
	let repository: EventRepository
	let useCase: GetEventByIdUseCase

	beforeEach(() => {
		repository = buildRepository()
		useCase = new GetEventByIdUseCase(repository)
	})

	it('returns the event when it is published', async () => {
		const event = buildEvent({ status: 'published' })
		vi.mocked(repository.findById).mockResolvedValue(event)

		expect(await useCase.execute('event-1')).toEqual(event)
	})

	it('throws when it does not', async () => {
		vi.mocked(repository.findById).mockResolvedValue(null)

		await expect(useCase.execute('missing')).rejects.toThrow(EventNotFoundError)
	})

	// The route is anonymous and the list narrows to `published`, so this read
	// used to be the way around it: a draft was readable by its id alone.
	it.each(['draft', 'cancelled'] as const)(
		'answers not found on a %s event',
		async status => {
			vi.mocked(repository.findById).mockResolvedValue(buildEvent({ status }))

			await expect(useCase.execute('event-1')).rejects.toThrow(
				EventNotFoundError,
			)
		},
	)
})
