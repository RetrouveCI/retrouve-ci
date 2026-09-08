import { Module } from '@nestjs/common'
import { NotificationsDomainModule } from '@/domains/notifications/notifications-domain.module'
import { ContactMessageRepository } from './repository/contact-message.repository'
import { CreateContactMessageUseCase } from './use-cases/create-contact-message.use-case'
import { GetContactMessageUseCase } from './use-cases/get-contact-message.use-case'
import { GetPaginatedContactMessagesUseCase } from './use-cases/get-paginated-contact-messages.use-case'
import { UpdateContactMessageStatusUseCase } from './use-cases/update-contact-message-status.use-case'

// A message arriving tells the desk, so it writes through `notifications`.
@Module({
	imports: [NotificationsDomainModule],
	providers: [
		ContactMessageRepository,
		CreateContactMessageUseCase,
		GetContactMessageUseCase,
		GetPaginatedContactMessagesUseCase,
		UpdateContactMessageStatusUseCase,
	],
	exports: [
		ContactMessageRepository,
		CreateContactMessageUseCase,
		GetContactMessageUseCase,
		GetPaginatedContactMessagesUseCase,
		UpdateContactMessageStatusUseCase,
	],
})
export class ContactMessagesDomainModule {}
