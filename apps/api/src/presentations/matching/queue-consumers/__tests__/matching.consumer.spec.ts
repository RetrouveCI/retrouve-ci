import { type Job, UnrecoverableError } from 'bullmq'
import { describe, expect, it, vi } from 'vitest'
import { LostItemNotFoundError } from '@/domains/lost-items/errors/lost-item.errors'
import type { NotifyMatchesUseCase } from '@/domains/matching/use-cases/notify-matches.use-case'
import type { FindMatchesJobData } from '@/infrastructures/queue/matching-dispatcher.service'
import { MatchingConsumer } from '../matching.consumer'

function buildJob(attemptsMade = 0) {
	return {
		data: { lostItemId: 'lost-item-1' },
		attemptsMade,
	} as Job<FindMatchesJobData>
}

function buildConsumer(execute = vi.fn().mockResolvedValue(undefined)) {
	const consumer = new MatchingConsumer({
		execute,
	} as unknown as NotifyMatchesUseCase)
	const logged: string[] = []
	const logger = (consumer as unknown as { logger: { error: unknown } }).logger
	vi.spyOn(
		logger as { error: (m: string) => void },
		'error',
	).mockImplementation(message => {
		logged.push(String(message))
	})
	return { consumer, execute, logged }
}

describe('MatchingConsumer', () => {
	it('hands the job’s lost item id to the use-case', async () => {
		const { consumer, execute } = buildConsumer()

		await consumer.process(buildJob())

		expect(execute).toHaveBeenCalledWith('lost-item-1')
	})

	// Rethrowing is what lets BullMQ retry with its backoff.
	it('rethrows a transient failure so the job is retried', async () => {
		const { consumer } = buildConsumer(
			vi.fn().mockRejectedValue(new Error('connection reset')),
		)

		await expect(consumer.process(buildJob())).rejects.toThrow(
			'connection reset',
		)
	})

	// A listing deleted between publication and this job never comes back, so
	// it must not burn the retries a transient failure needs.
	it('does not retry a lost item that no longer exists', async () => {
		const { consumer } = buildConsumer(
			vi.fn().mockRejectedValue(new LostItemNotFoundError('lost-item-1')),
		)

		await expect(consumer.process(buildJob())).rejects.toBeInstanceOf(
			UnrecoverableError,
		)
	})

	it('names the lost item and the attempt in the failure log', async () => {
		const { consumer, logged } = buildConsumer(
			vi.fn().mockRejectedValue(new Error('connection reset')),
		)

		await expect(consumer.process(buildJob(1))).rejects.toThrow()

		expect(logged).toHaveLength(1)
		expect(logged[0]).toContain('lost-item-1')
		expect(logged[0]).toContain('attempt 2/3')
		expect(logged[0]).toContain('connection reset')
	})
})
