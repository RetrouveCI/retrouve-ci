import { beforeEach, describe, expect, it, vi } from 'vitest'
import { buildEvent, buildRepository } from '../../__tests__/event.fixture'
import { EventNotFoundError } from '../../errors/event.errors'
import type { EventRepository } from '../../repository/event.repository'
import { DeleteEventUseCase } from '../delete-event.use-case'

describe('DeleteEventUseCase', () => {
	let repository: EventRepository
	let useCase: DeleteEventUseCase

	beforeEach(() => {
		repository = buildRepository()
		useCase = new DeleteEventUseCase(repository)
	})

	it('deletes after checking existence', async () => {
		vi.mocked(repository.findById).mockResolvedValue(buildEvent())
		vi.mocked(repository.delete).mockResolvedValue(undefined)

		await useCase.execute('event-1')

		expect(repository.delete).toHaveBeenCalledWith('event-1')
	})

	it('throws without deleting when the event does not exist', async () => {
		vi.mocked(repository.findById).mockResolvedValue(null)

		await expect(useCase.execute('missing')).rejects.toThrow(EventNotFoundError)
		expect(repository.delete).not.toHaveBeenCalled()
	})
})
