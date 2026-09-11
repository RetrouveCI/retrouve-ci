import { Controller, Get, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import {
	dashboardPeriodSchema,
	type DashboardPeriodData,
} from '@app/contracts/reporting'
import { AllowAnonymous, Roles } from '@thallesp/nestjs-better-auth'
import { GetPublicCountersUseCase } from '@/domains/lost-items/use-cases/get-public-counters.use-case'
import { GetDashboardStatsUseCase } from '@/domains/reporting/use-cases/get-dashboard-stats.use-case'
import { CountPushSubscriptionsUseCase } from '@/domains/notifications/use-cases/count-push-subscriptions.use-case'
import { ZodValidationPipe } from '@/shared/pipes/zod-validation.pipe'
import { ApiZodQuery } from '@/shared/swagger/api-zod.decorator'

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

	/** Naming neither bound reads the last thirty days, as it always did. */
	@Get()
	@Roles(['admin'])
	@ApiZodQuery(dashboardPeriodSchema)
	getDashboardStats(
		@Query(new ZodValidationPipe(dashboardPeriodSchema))
		period: DashboardPeriodData,
	) {
		return this.getDashboardStatsUseCase.execute(period)
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
