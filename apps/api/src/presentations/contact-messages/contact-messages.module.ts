import { Module } from '@nestjs/common'
import { CONTACT_MESSAGE_REPOSITORY } from '@/domains/contact-messages/repository/contact-message.repository'
import { ContactMessageRepositoryService } from '@/domains/contact-messages/repository/contact-message.repository.service'
import { ContactMessageUseCases } from '@/domains/contact-messages/use-cases/contact-message.use-cases'
import { ContactMessagesController } from './controllers/contact-messages.controller'

@Module({
	controllers: [ContactMessagesController],
	providers: [
		ContactMessageUseCases,
		{
			provide: CONTACT_MESSAGE_REPOSITORY,
			useClass: ContactMessageRepositoryService,
		},
	],
	exports: [ContactMessageUseCases, CONTACT_MESSAGE_REPOSITORY],
})
export class ContactMessagesModule {}
