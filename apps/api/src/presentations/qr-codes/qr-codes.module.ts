import { Module } from '@nestjs/common'
import { ContactMessagesDomainModule } from '@/domains/contact-messages/contact-messages-domain.module'
import { NotificationsDomainModule } from '@/domains/notifications/notifications-domain.module'
import { QrCodesDomainModule } from '@/domains/qr-codes/qr-codes-domain.module'
import { QrCodesController } from './qr-codes.controller'

@Module({
	imports: [
		QrCodesDomainModule,
		ContactMessagesDomainModule,
		NotificationsDomainModule,
	],
	controllers: [QrCodesController],
})
export class QrCodesModule {}
