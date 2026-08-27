import { Injectable, Logger } from '@nestjs/common'
import type { IDomainUseCase } from '@/shared/types/domain-use-case.type'
import { ContactMessageRepository } from '../repository/contact-message.repository'
import type {
	ContactMessage,
	CreateContactMessageData,
} from '../types/contact-message.types'

@Injectable()
export class CreateContactMessageUseCase implements IDomainUseCase<
	CreateContactMessageData,
	ContactMessage
> {
	private readonly logger = new Logger(CreateContactMessageUseCase.name)

	constructor(private readonly repository: ContactMessageRepository) {}

	async execute(data: CreateContactMessageData): Promise<ContactMessage> {
		const contactMessage = await this.repository.create(data)

		this.logger.log(`Contact message ${contactMessage.id} created`)

		return contactMessage
	}
}
