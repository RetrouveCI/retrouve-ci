import { Injectable, Logger } from '@nestjs/common'
import type { IDomainUseCase } from '@/shared/types/domain-use-case.type'
import { requireContactMessage } from '../helpers/require-contact-message'
import { ContactMessageRepository } from '../repository/contact-message.repository'
import type { ContactMessage } from '../types/contact-message.types'

/**
 * Reading a message is what marks it read — opening it in the backoffice is the
 * only signal the API gets. A message already read is returned untouched, so
 * `readAt` keeps the first read rather than the latest.
 */
@Injectable()
export class GetContactMessageUseCase implements IDomainUseCase<
	string,
	ContactMessage
> {
	private readonly logger = new Logger(GetContactMessageUseCase.name)

	constructor(private readonly repository: ContactMessageRepository) {}

	async execute(id: string): Promise<ContactMessage> {
		const contactMessage = await requireContactMessage(this.repository, id)

		if (contactMessage.status !== 'new') {
			return contactMessage
		}

		this.logger.log(`Contact message ${id} marked as read`)

		return this.repository.updateStatus(id, 'read')
	}
}
