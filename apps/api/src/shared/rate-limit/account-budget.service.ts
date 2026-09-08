import { Inject, Injectable, Logger, Optional } from '@nestjs/common'
import { AccountBudgetExceededError } from './account-budget.error'
import { ACCOUNT_BUDGET_COUNTER } from './rate-limit.tokens'
import type { AccountLimit } from './rate-limit.policy'
import type { RateLimitCounter } from './rate-limit.store'

// The ceilings the hook cannot hold: it runs before the session is read, so it
// keys on a rotatable address. One service, since only a constant differed.
@Injectable()
export class AccountBudget {
	private readonly logger = new Logger(AccountBudget.name)

	constructor(
		@Optional()
		@Inject(ACCOUNT_BUDGET_COUNTER)
		private readonly counter?: RateLimitCounter,
	) {}

	async require(limit: AccountLimit, userId: string): Promise<void> {
		if (!this.counter) return

		let hit

		try {
			hit = await this.counter.hit(
				`rl:${limit.keyPrefix}:${userId}`,
				limit.windowSeconds,
			)
		} catch (error) {
			// Fail open, loudly, as every other ceiling here does: a counter that
			// cannot reach Redis must not stop a visitor from using the site.
			this.logger.error(`Account budget store unreachable, allowing: ${error}`)
			return
		}

		if (hit.count > limit.max) {
			throw new AccountBudgetExceededError(limit.message, hit.ttlSeconds)
		}
	}
}
