import { Module } from '@nestjs/common'
import { ContactMessagesDomainModule } from '@/domains/contact-messages/contact-messages-domain.module'
import { ContactMessagesController } from './contact-messages.controller'

@Module({
	imports: [ContactMessagesDomainModule],
	controllers: [ContactMessagesController],
})
export class ContactMessagesModule {}
