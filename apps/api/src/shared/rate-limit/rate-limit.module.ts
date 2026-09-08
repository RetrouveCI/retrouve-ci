import { Module } from '@nestjs/common'
import { AccountBudget } from './account-budget.service'
import { ACCOUNT_BUDGET_COUNTER } from './rate-limit.tokens'
import { createRedisCounter } from './rate-limit.store'

@Module({
	providers: [
		AccountBudget,
		{
			provide: ACCOUNT_BUDGET_COUNTER,
			useFactory: () => {
				const url = process.env.REDIS_URL?.trim()

				return url ? createRedisCounter(url) : undefined
			},
		},
	],
	exports: [AccountBudget],
})
export class RateLimitModule {}
