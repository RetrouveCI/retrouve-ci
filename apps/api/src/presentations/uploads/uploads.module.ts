import { Module } from '@nestjs/common'
import { StorageModule } from '@/infrastructures/storage/storage.module'
import { RateLimitModule } from '@/shared/rate-limit/rate-limit.module'
import { UploadsController } from './uploads.controller'

@Module({
	imports: [StorageModule, RateLimitModule],
	controllers: [UploadsController],
})
export class UploadsModule {}
