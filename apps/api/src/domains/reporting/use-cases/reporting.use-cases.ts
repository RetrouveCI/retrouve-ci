import { Inject, Injectable } from '@nestjs/common'
import type { DashboardStats } from '../models/dashboard-stats.model'
import {
	REPORTING_REPOSITORY,
	type ReportingRepository,
} from '../repository/reporting.repository'

@Injectable()
export class ReportingUseCases {
	constructor(
		@Inject(REPORTING_REPOSITORY)
		private readonly reportingRepository: ReportingRepository,
	) {}

	getDashboardStats(): Promise<DashboardStats> {
		return this.reportingRepository.getDashboardStats()
	}
}
