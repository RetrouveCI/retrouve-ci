import { beforeEach, describe, expect, it, vi } from 'vitest'
import { buildEvent, buildRepository } from '../../__tests__/event.fixture'
import { EventNotFoundError } from '../../errors/event.errors'
import type { EventRepository } from '../../repository/event.repository'
import { UpdateEventUseCase } from '../update-event.use-case'

describe('UpdateEventUseCase', () => {
	let repository: EventRepository
	let useCase: UpdateEventUseCase

	beforeEach(() => {
		repository = buildRepository()
		useCase = new UpdateEventUseCase(repository)
	})

	it('updates after checking existence', async () => {
		const updated = buildEvent({ title: 'Nouveau titre' })
		vi.mocked(repository.findById).mockResolvedValue(buildEvent())
		vi.mocked(repository.update).mockResolvedValue(updated)

		const result = await useCase.execute({
			id: 'event-1',
			data: { title: 'Nouveau titre' },
		})

		expect(repository.update).toHaveBeenCalledWith('event-1', {
			title: 'Nouveau titre',
		})
		expect(result).toEqual(updated)
	})

	it('throws without writing when the event does not exist', async () => {
		vi.mocked(repository.findById).mockResolvedValue(null)

		await expect(
			useCase.execute({ id: 'missing', data: { title: 'X' } }),
		).rejects.toThrow(EventNotFoundError)
		expect(repository.update).not.toHaveBeenCalled()
	})
})
