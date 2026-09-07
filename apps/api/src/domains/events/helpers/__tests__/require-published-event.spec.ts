import { describe, expect, it, vi } from 'vitest'
import { EVENT_STATUSES } from '@app/contracts/events'
import { buildEvent, buildRepository } from '../../__tests__/event.fixture'
import { EventNotFoundError } from '../../errors/event.errors'
import { requirePublishedEvent } from '../require-published-event'

describe('requirePublishedEvent', () => {
	it.each(EVENT_STATUSES)(
		'reads a %s event as the public may',
		async status => {
			const repository = buildRepository()
			vi.mocked(repository.findById).mockResolvedValue(buildEvent({ status }))

			const read = requirePublishedEvent(repository, 'event-1')

			if (status === 'published') {
				expect((await read).status).toBe('published')
			} else {
				await expect(read).rejects.toThrow(EventNotFoundError)
			}
		},
	)

	it('answers not found when the id is unknown', async () => {
		const repository = buildRepository()
		vi.mocked(repository.findById).mockResolvedValue(null)

		await expect(requirePublishedEvent(repository, 'missing')).rejects.toThrow(
			EventNotFoundError,
		)
	})
})
