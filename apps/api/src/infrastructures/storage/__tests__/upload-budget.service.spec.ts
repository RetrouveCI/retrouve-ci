import { beforeEach, describe, expect, it, vi } from 'vitest'
import { UPLOAD_PER_USER } from '@/shared/rate-limit/rate-limit.policy'
import type { RateLimitCounter } from '@/shared/rate-limit/rate-limit.store'
import { UploadBudgetExceededError } from '../upload-budget.error'
import { UploadBudget } from '../upload-budget.service'

function buildCounter(): RateLimitCounter {
	return { hit: vi.fn(), close: vi.fn() } as unknown as RateLimitCounter
}

describe('UploadBudget', () => {
	let counter: RateLimitCounter

	beforeEach(() => {
		counter = buildCounter()
		vi.mocked(counter.hit).mockResolvedValue({ count: 1, ttlSeconds: 3600 })
	})

	it('counts on the account, which cannot be rotated', async () => {
		await new UploadBudget(counter).require('user-1')

		expect(counter.hit).toHaveBeenCalledWith(
			'rl:upload-user:user-1',
			UPLOAD_PER_USER.windowSeconds,
		)
	})

	it.each([
		[1, false],
		[UPLOAD_PER_USER.max, false],
		[UPLOAD_PER_USER.max + 1, true],
	])('reads hit %i as refused=%s', async (count, refused) => {
		vi.mocked(counter.hit).mockResolvedValue({ count, ttlSeconds: 900 })

		const attempt = new UploadBudget(counter).require('user-1')

		if (refused) {
			await expect(attempt).rejects.toBeInstanceOf(UploadBudgetExceededError)
		} else {
			await expect(attempt).resolves.toBeUndefined()
		}
	})

	// The delay travels with the refusal: asking for it would spend a hit, and
	// keep the window alive for as long as anyone polled it.
	it('carries the remaining window on the refusal', async () => {
		vi.mocked(counter.hit).mockResolvedValue({
			count: UPLOAD_PER_USER.max + 1,
			ttlSeconds: 900,
		})

		const thrown: unknown = await new UploadBudget(counter)
			.require('user-1')
			.catch((error: unknown) => error)

		expect((thrown as UploadBudgetExceededError).retryAfterSeconds).toBe(900)
		expect(counter.hit).toHaveBeenCalledTimes(1)
	})

	// Fails open, as both other ceilings do — and development, with no
	// `REDIS_URL` at all, takes the same path.
	it('allows the upload when the store is unreachable', async () => {
		vi.mocked(counter.hit).mockRejectedValue(new Error('ECONNREFUSED'))

		await expect(
			new UploadBudget(counter).require('user-1'),
		).resolves.toBeUndefined()
	})

	it('allows the upload when no counter is wired at all', async () => {
		await expect(new UploadBudget().require('user-1')).resolves.toBeUndefined()
	})
})
