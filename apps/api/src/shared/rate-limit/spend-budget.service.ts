import { Inject, Injectable, Logger, Optional } from '@nestjs/common'
import { ACCOUNT_BUDGET_COUNTER } from './rate-limit.tokens'
import type { SpendLimit } from './rate-limit.policy'
import type { RateLimitCounter } from './rate-limit.store'

/** `2026-09`, so the counter resets with the month the invoice covers. */
export function monthKey(now: Date): string {
	return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`
}

/**
 * ⚠️ **The one ceiling here that fails closed**, and deliberately. Every other
 * one protects the site from a caller, so an unreachable store must not refuse
 * a visitor; this one protects the bill from the site, and failing open would
 * spend money with nothing counting it. Failing closed costs nothing: the
 * assistant answers `unavailable` and the search by filters stays open, which
 * is the repli the route is built around either way.
 */
@Injectable()
export class SpendBudget {
	private readonly logger = new Logger(SpendBudget.name)

	constructor(
		@Optional()
		@Inject(ACCOUNT_BUDGET_COUNTER)
		private readonly counter?: RateLimitCounter,
	) {}

	/** Counts the call before it is made: a burst must not overshoot. */
	async allows(limit: SpendLimit, now = new Date()): Promise<boolean> {
		if (!this.counter) {
			this.logger.warn(`No counter for ${limit.keyPrefix}, holding the budget`)
			return false
		}

		try {
			// Two months of room, so the key outlives the month it counts and is
			// collected on its own rather than by anything having to tidy up.
			const hit = await this.counter.hit(
				`rl:${limit.keyPrefix}:${monthKey(now)}`,
				60 * 24 * 60 * 60,
			)

			return hit.count <= limit.max
		} catch (error) {
			this.logger.error(`Spend budget store unreachable, holding: ${error}`)
			return false
		}
	}
}
