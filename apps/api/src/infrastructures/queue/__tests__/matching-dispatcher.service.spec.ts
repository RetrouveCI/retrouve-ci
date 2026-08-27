import type { Queue } from 'bullmq'
import { describe, expect, it, vi } from 'vitest'
import {
	MatchingDispatcher,
	type FindMatchesJobData,
} from '../matching-dispatcher.service'
import {
	FIND_MATCHES_JOB,
	MATCHING_ATTEMPTS,
	MATCHING_BACKOFF_DELAY_MS,
	MATCHING_KEEP_COMPLETED,
	MATCHING_KEEP_FAILED_SECONDS,
} from '../queue.constants'

function buildDispatcher(add = vi.fn().mockResolvedValue(undefined)) {
	const dispatcher = new MatchingDispatcher({
		add,
	} as unknown as Queue<FindMatchesJobData>)
	return { dispatcher, add }
}

function optionsOf(add: ReturnType<typeof vi.fn>) {
	return add.mock.calls[0]?.[2] as Record<string, unknown>
}

describe('MatchingDispatcher', () => {
	it('queues the lost item id under the documented job name', async () => {
		const { dispatcher, add } = buildDispatcher()

		await dispatcher.dispatch('lost-item-1')

		expect(add).toHaveBeenCalledTimes(1)
		const [name, data] = add.mock.calls[0] as [string, FindMatchesJobData]
		expect(name).toBe(FIND_MATCHES_JOB)
		expect(data).toEqual({ lostItemId: 'lost-item-1' })
	})

	// The enqueue used to pass no options, so BullMQ gave it a single attempt.
	it('retries with an exponential backoff', async () => {
		const { dispatcher, add } = buildDispatcher()

		await dispatcher.dispatch('lost-item-1')

		expect(MATCHING_ATTEMPTS).toBeGreaterThan(1)
		expect(optionsOf(add).attempts).toBe(MATCHING_ATTEMPTS)
		expect(optionsOf(add).backoff).toEqual({
			type: 'exponential',
			delay: MATCHING_BACKOFF_DELAY_MS,
		})
	})

	// Without an eviction rule every settled job stayed in Redis for good.
	it('bounds what it leaves in Redis once a job settles', async () => {
		const { dispatcher, add } = buildDispatcher()

		await dispatcher.dispatch('lost-item-1')

		expect(optionsOf(add).removeOnComplete).toEqual({
			count: MATCHING_KEEP_COMPLETED,
		})
		expect(optionsOf(add).removeOnFail).toEqual({
			age: MATCHING_KEEP_FAILED_SECONDS,
		})
	})

	// The moderation request awaits this, so a dead Redis is reported rather
	// than swallowed into a publication that silently notifies nobody.
	it('propagates a failure to enqueue', async () => {
		const { dispatcher } = buildDispatcher(
			vi.fn().mockRejectedValue(new Error('redis down')),
		)

		await expect(dispatcher.dispatch('lost-item-1')).rejects.toThrow(
			'redis down',
		)
	})
})
