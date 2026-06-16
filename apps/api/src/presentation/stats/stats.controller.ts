import { Controller, Get } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { Roles } from '@thallesp/nestjs-better-auth'
import { StatsService } from './stats.service'

@ApiTags('stats')
@ApiBearerAuth()
@Controller('stats')
export class StatsController {
	constructor(private readonly statsService: StatsService) {}

	@Get()
	@Roles(['admin'])
	getDashboardStats() {
		return this.statsService.getDashboardStats()
	}
}
