import { Module } from '@nestjs/common'
import { QR_TOKEN_REPOSITORY } from '@/domains/qr-codes/repository/qr-token.repository'
import { QrTokenRepositoryService } from '@/domains/qr-codes/repository/qr-token.repository.service'
import { QrTokenUseCases } from '@/domains/qr-codes/use-cases/qr-token.use-cases'
import { QrCodesController } from './controllers/qr-codes.controller'

@Module({
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
