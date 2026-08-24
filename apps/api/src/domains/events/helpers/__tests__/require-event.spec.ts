import { describe, expect, it, vi } from 'vitest'
import { buildEvent, buildRepository } from '../../__tests__/event.fixture'
import { EventNotFoundError } from '../../errors/event.errors'
import { requireEvent } from '../require-event'

describe('requireEvent', () => {
	it('returns the event when it exists', async () => {
		const repository = buildRepository()
		const event = buildEvent()
		vi.mocked(repository.findById).mockResolvedValue(event)

		expect(await requireEvent(repository, 'event-1')).toEqual(event)
	})

	// The guard three use-cases share instead of calling each other.
	it('throws a domain error naming the id', async () => {
		const repository = buildRepository()
		vi.mocked(repository.findById).mockResolvedValue(null)

		await expect(requireEvent(repository, 'missing')).rejects.toThrow(
			EventNotFoundError,
		)
	})
})
