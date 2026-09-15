import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ASSISTANT_MONTHLY } from '../rate-limit.policy'
import type { RateLimitCounter } from '../rate-limit.store'
import { SpendBudget, monthKey } from '../spend-budget.service'

const hit = vi.fn()

const counter = { hit, close: vi.fn() } as unknown as RateLimitCounter

const SEPTEMBER = new Date('2026-09-15T10:30:00Z')

beforeEach(() => {
	hit.mockReset().mockResolvedValue({ count: 1, ttlSeconds: 1000 })
})

describe('the month a spend is counted against', () => {
	it('is the calendar month, so the counter resets with the invoice', () => {
		expect(monthKey(SEPTEMBER)).toBe('2026-09')
	})

	it('pads a single-digit month rather than sorting as a number', () => {
		expect(monthKey(new Date('2026-01-02T00:00:00Z'))).toBe('2026-01')
	})

	// Around midnight in Abidjan the local day and the UTC day differ; the key
	// has to pick one, and UTC is the one the store and the invoice share.
	it('reads the month in UTC', () => {
		expect(monthKey(new Date('2026-08-31T23:30:00Z'))).toBe('2026-08')
	})
})

describe('the installation budget', () => {
	it('allows a call inside the ceiling', async () => {
		hit.mockResolvedValue({ count: ASSISTANT_MONTHLY.max, ttlSeconds: 10 })

		expect(await new SpendBudget(counter).allows(ASSISTANT_MONTHLY)).toBe(true)
	})

	it('refuses the one past it', async () => {
		hit.mockResolvedValue({ count: ASSISTANT_MONTHLY.max + 1, ttlSeconds: 10 })

		expect(await new SpendBudget(counter).allows(ASSISTANT_MONTHLY)).toBe(false)
	})

	it('counts one key per month, keyed by the limit that owns it', async () => {
		await new SpendBudget(counter).allows(ASSISTANT_MONTHLY, SEPTEMBER)

		expect(hit).toHaveBeenCalledWith(
			'rl:assistant-month:2026-09',
			expect.any(Number),
		)
	})

	it('keeps the key alive past the month it counts', async () => {
		await new SpendBudget(counter).allows(ASSISTANT_MONTHLY, SEPTEMBER)

		const [, windowSeconds] = hit.mock.calls[0] as [string, number]

		expect(windowSeconds).toBeGreaterThan(31 * 24 * 60 * 60)
	})

	/**
	 * ⚠️ The one ceiling here that fails **closed**, and the reason is the
	 * direction it guards: every other one protects the site from a caller, so
	 * an unreachable store must not refuse a visitor. This one protects the bill
	 * from the site, and failing open would spend with nothing counting.
	 */
	it('holds the budget when the store is unreachable', async () => {
		hit.mockRejectedValue(new Error('ECONNREFUSED'))

		expect(await new SpendBudget(counter).allows(ASSISTANT_MONTHLY)).toBe(false)
	})

	it('holds the budget when there is no store at all', async () => {
		expect(await new SpendBudget().allows(ASSISTANT_MONTHLY)).toBe(false)
	})
})
