import { Module } from '@nestjs/common'
import { StorageModule } from '@/infrastructures/storage/storage.module'
import { UploadsController } from './controllers/uploads.controller'

@Module({
	imports: [StorageModule],
	controllers: [UploadsController],
})
export class UploadsModule {}
