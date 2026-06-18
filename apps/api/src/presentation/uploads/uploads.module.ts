import { Module } from '@nestjs/common'
import { FastifyMulterModule } from '@nest-lab/fastify-multer'
import { StorageModule } from '@/infrastructure/storage/storage.module'
import { UploadsController } from './controllers/uploads.controller'

@Module({
	imports: [FastifyMulterModule, StorageModule],
	controllers: [UploadsController],
})
export class UploadsModule {}
