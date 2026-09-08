import { Inject, Injectable, Logger, Optional } from '@nestjs/common'
import { UPLOAD_PER_USER } from '@/shared/rate-limit/rate-limit.policy'
import type { RateLimitCounter } from '@/shared/rate-limit/rate-limit.store'
import { UPLOAD_BUDGET_COUNTER } from './storage.tokens'
import { UploadBudgetExceededError } from './upload-budget.error'

// The choke point where an upload starts costing money, and the only place the
// owner is known: the hook runs before the session is read, so it can key only
// on the forwarded address — which is rotatable. An account is not.
@Injectable()
export class UploadBudget {
	private readonly logger = new Logger(UploadBudget.name)

	constructor(
		@Optional()
		@Inject(UPLOAD_BUDGET_COUNTER)
		private readonly counter?: RateLimitCounter,
	) {}

	async require(userId: string): Promise<void> {
		if (!this.counter) return

		let hit
		try {
			hit = await this.counter.hit(
				`rl:upload-user:${userId}`,
				UPLOAD_PER_USER.windowSeconds,
			)
		} catch (error) {
			// Fail open, loudly, as both other ceilings do: a counter that cannot
			// reach Redis must not stop every poster from publishing.
			this.logger.error(`Upload budget store unreachable, allowing: ${error}`)
			return
		}

		if (hit.count > UPLOAD_PER_USER.max) {
			throw new UploadBudgetExceededError(hit.ttlSeconds)
		}
	}
}
