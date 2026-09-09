import { Controller, Get } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { AllowAnonymous, Roles } from '@thallesp/nestjs-better-auth'
import { GetPublicCountersUseCase } from '@/domains/lost-items/use-cases/get-public-counters.use-case'
import { GetDashboardStatsUseCase } from '@/domains/reporting/use-cases/get-dashboard-stats.use-case'
import { CountPushSubscriptionsUseCase } from '@/domains/notifications/use-cases/count-push-subscriptions.use-case'

@ApiTags('stats')
@ApiBearerAuth()
@Controller('stats')
export class StatsController {
	constructor(
		private readonly getDashboardStatsUseCase: GetDashboardStatsUseCase,
		private readonly getPublicCountersUseCase: GetPublicCountersUseCase,
		private readonly countPushSubscriptions: CountPushSubscriptionsUseCase,
	) {}

	/**
	 * Deliberately **not** capped: a front reads it server-side, so the address a
	 * limiter would see is the front's container, and a cap there refuses
	 * everyone at once — the reason `get-session` is exempt too.
	 */
	@Get('counters')
	@AllowAnonymous()
	getPublicCounters() {
		return this.getPublicCountersUseCase.execute()
	}

	@Get()
	@Roles(['admin'])
	getDashboardStats() {
		return this.getDashboardStatsUseCase.execute()
	}

	// A bare number, as `/notifications/unread-count` answers one. The figure A3
	// waits on: a subscription needs an install *and* a granted permission, so
	// counting them says whether a push would reach anyone, measuring no usage.
	@Get('push-subscriptions')
	@Roles(['admin'])
	getPushSubscriptionCount() {
		return this.countPushSubscriptions.execute()
	}
}
