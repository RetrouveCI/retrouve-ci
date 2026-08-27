import { Controller, Get } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { Roles } from '@thallesp/nestjs-better-auth'
import { GetDashboardStatsUseCase } from '@/domains/reporting/use-cases/get-dashboard-stats.use-case'

@ApiTags('stats')
@ApiBearerAuth()
@Controller('stats')
export class StatsController {
	constructor(
		private readonly getDashboardStatsUseCase: GetDashboardStatsUseCase,
	) {}

	@Get()
	@Roles(['admin'])
	getDashboardStats() {
		return this.getDashboardStatsUseCase.execute()
	}
}
