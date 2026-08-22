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

	it('returns the event when it exists', async () => {
		const event = buildEvent()
		vi.mocked(repository.findById).mockResolvedValue(event)

		expect(await useCase.execute('event-1')).toEqual(event)
	})

	it('throws when it does not', async () => {
		vi.mocked(repository.findById).mockResolvedValue(null)

		await expect(useCase.execute('missing')).rejects.toThrow(EventNotFoundError)
	})
})
