import { Module } from '@nestjs/common'
import { QR_TOKEN_REPOSITORY } from '@/domains/qr-codes/repository/qr-token.repository'
import { QrTokenRepositoryService } from '@/domains/qr-codes/repository/qr-token.repository.service'
import { QrTokenUseCases } from '@/domains/qr-codes/use-cases/qr-token.use-cases'
import { ContactMessagesModule } from '@/presentation/contact-messages/contact-messages.module'
import { NotificationsModule } from '@/presentation/notifications/notifications.module'
import { QrCodesController } from './controllers/qr-codes.controller'

@Module({
	imports: [ContactMessagesModule, NotificationsModule],
	controllers: [QrCodesController],
	providers: [
		QrTokenUseCases,
		{
			provide: QR_TOKEN_REPOSITORY,
			useClass: QrTokenRepositoryService,
		},
	],
})
export class QrCodesModule {}
