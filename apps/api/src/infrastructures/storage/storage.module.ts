import { Module } from '@nestjs/common'
import { createRedisCounter } from '@/shared/rate-limit/rate-limit.store'
import { StorageService } from './storage.service'
import { UPLOAD_BUDGET_COUNTER } from './storage.tokens'
import { UploadBudget } from './upload-budget.service'

@Module({
	providers: [
		StorageService,
		UploadBudget,
		{
			provide: UPLOAD_BUDGET_COUNTER,
			useFactory: () => {
				const url = process.env.REDIS_URL?.trim()

				return url ? createRedisCounter(url) : undefined
			},
		},
	],
	exports: [StorageService, UploadBudget],
})
export class StorageModule {}
