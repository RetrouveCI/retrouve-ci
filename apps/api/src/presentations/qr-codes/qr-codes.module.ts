import { Module } from '@nestjs/common'
import { QrCodesDomainModule } from '@/domains/qr-codes/qr-codes-domain.module'
import { QrCodesController } from './qr-codes.controller'

@Module({
	imports: [QrCodesDomainModule],
	controllers: [QrCodesController],
})
export class QrCodesModule {}
