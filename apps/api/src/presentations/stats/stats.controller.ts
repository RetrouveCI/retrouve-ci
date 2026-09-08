import { Controller, Get } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { AllowAnonymous, Roles } from '@thallesp/nestjs-better-auth'
import { GetPublicCountersUseCase } from '@/domains/lost-items/use-cases/get-public-counters.use-case'
import { GetDashboardStatsUseCase } from '@/domains/reporting/use-cases/get-dashboard-stats.use-case'

@ApiTags('stats')
@ApiBearerAuth()
@Controller('stats')
export class StatsController {
	constructor(
		private readonly getDashboardStatsUseCase: GetDashboardStatsUseCase,
		private readonly getPublicCountersUseCase: GetPublicCountersUseCase,
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
}
