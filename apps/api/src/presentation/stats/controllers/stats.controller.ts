import { Controller, Get } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { Roles } from '@thallesp/nestjs-better-auth'
import { ReportingUseCases } from '@/domains/reporting/use-cases/reporting.use-cases'

@ApiTags('stats')
@ApiBearerAuth()
@Controller('stats')
export class StatsController {
	constructor(private readonly reportingUseCases: ReportingUseCases) {}

	@Get()
	@Roles(['admin'])
	getDashboardStats() {
		return this.reportingUseCases.getDashboardStats()
	}
}
