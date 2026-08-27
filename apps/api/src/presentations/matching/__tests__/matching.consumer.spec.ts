import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Job } from 'bullmq'
import type { NotifyMatchesUseCase } from '@/domains/matching/use-cases/notify-matches.use-case'
import { MatchingConsumer } from '../queue-consumers/matching.consumer'

describe('MatchingConsumer', () => {
	let notifyMatchesUseCase: NotifyMatchesUseCase
	let consumer: MatchingConsumer

	beforeEach(() => {
		notifyMatchesUseCase = {
			execute: vi.fn(),
		} as unknown as NotifyMatchesUseCase
		consumer = new MatchingConsumer(notifyMatchesUseCase)
	})

	it('passes the job payload lost item id to the use-case', async () => {
		await consumer.process({
			data: { lostItemId: 'lost-item-1' },
		} as Job<{ lostItemId: string }>)

		expect(notifyMatchesUseCase.execute).toHaveBeenCalledWith('lost-item-1')
	})
})
