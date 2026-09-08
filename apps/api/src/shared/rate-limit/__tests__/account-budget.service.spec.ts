import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
	LOST_ITEM_PER_USER,
	UPLOAD_PER_USER,
	type AccountLimit,
} from '../rate-limit.policy'
import type { RateLimitCounter } from '../rate-limit.store'
import { AccountBudgetExceededError } from '../account-budget.error'
import { AccountBudget } from '../account-budget.service'

function buildCounter(): RateLimitCounter {
	return { hit: vi.fn(), close: vi.fn() } as unknown as RateLimitCounter
}

const LIMITS: AccountLimit[] = [UPLOAD_PER_USER, LOST_ITEM_PER_USER]

describe('AccountBudget', () => {
	let counter: RateLimitCounter

	beforeEach(() => {
		counter = buildCounter()
		vi.mocked(counter.hit).mockResolvedValue({ count: 1, ttlSeconds: 3600 })
	})

	it.each(LIMITS)(
		'counts $keyPrefix on the account, which cannot be rotated',
		async limit => {
			await new AccountBudget(counter).require(limit, 'user-1')

			expect(counter.hit).toHaveBeenCalledWith(
				`rl:${limit.keyPrefix}:user-1`,
				limit.windowSeconds,
			)
		},
	)

	// One key per limit, or a poster's listings would eat their photo budget.
	it('gives each limit its own key', async () => {
		const budget = new AccountBudget(counter)

		await budget.require(UPLOAD_PER_USER, 'user-1')
		await budget.require(LOST_ITEM_PER_USER, 'user-1')

		const keys = vi.mocked(counter.hit).mock.calls.map(([key]) => key)

		expect(new Set(keys).size).toBe(2)
	})

	it.each([
		[1, false],
		[UPLOAD_PER_USER.max, false],
		[UPLOAD_PER_USER.max + 1, true],
	])('reads hit %i as refused=%s', async (count, refused) => {
		vi.mocked(counter.hit).mockResolvedValue({ count, ttlSeconds: 900 })

		const attempt = new AccountBudget(counter).require(
			UPLOAD_PER_USER,
			'user-1',
		)

		if (refused) {
			await expect(attempt).rejects.toBeInstanceOf(AccountBudgetExceededError)
		} else {
			await expect(attempt).resolves.toBeUndefined()
		}
	})

	it.each(LIMITS)('refuses $keyPrefix with its own message', async limit => {
		vi.mocked(counter.hit).mockResolvedValue({
			count: limit.max + 1,
			ttlSeconds: 900,
		})

		await expect(
			new AccountBudget(counter).require(limit, 'user-1'),
		).rejects.toThrow(limit.message)
	})

	// The delay travels with the refusal: asking for it would spend a hit, and
	// keep the window alive for as long as anyone polled it.
	it('carries the remaining window on the refusal', async () => {
		vi.mocked(counter.hit).mockResolvedValue({
			count: UPLOAD_PER_USER.max + 1,
			ttlSeconds: 900,
		})

		const thrown: unknown = await new AccountBudget(counter)
			.require(UPLOAD_PER_USER, 'user-1')
			.catch((error: unknown) => error)

		expect((thrown as AccountBudgetExceededError).retryAfterSeconds).toBe(900)
		expect(counter.hit).toHaveBeenCalledTimes(1)
	})

	// Fails open, as every other ceiling does — and development, with no
	// `REDIS_URL` at all, takes the same path.
	it('allows the write when the store is unreachable', async () => {
		vi.mocked(counter.hit).mockRejectedValue(new Error('ECONNREFUSED'))

		await expect(
			new AccountBudget(counter).require(UPLOAD_PER_USER, 'user-1'),
		).resolves.toBeUndefined()
	})

	it('allows the write when no counter is wired at all', async () => {
		await expect(
			new AccountBudget().require(UPLOAD_PER_USER, 'user-1'),
		).resolves.toBeUndefined()
	})
})
