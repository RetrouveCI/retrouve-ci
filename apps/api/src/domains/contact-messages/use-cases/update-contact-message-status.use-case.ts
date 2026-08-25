import { Injectable, Logger } from '@nestjs/common'
import type { IDomainUseCase } from '@/shared/types/domain-use-case.type'
import { requireContactMessage } from '../helpers/require-contact-message'
import { ContactMessageRepository } from '../repository/contact-message.repository'
import type {
	ContactMessage,
	ContactMessageStatus,
} from '../types/contact-message.types'

interface UpdateContactMessageStatusInput {
	id: string
	status: ContactMessageStatus
}

@Injectable()
export class UpdateContactMessageStatusUseCase implements IDomainUseCase<
	UpdateContactMessageStatusInput,
	ContactMessage
> {
	private readonly logger = new Logger(UpdateContactMessageStatusUseCase.name)

	constructor(private readonly repository: ContactMessageRepository) {}

	async execute({
		id,
		status,
	}: UpdateContactMessageStatusInput): Promise<ContactMessage> {
		await requireContactMessage(this.repository, id)

		this.logger.log(`Contact message ${id} moved to ${status}`)

		return this.repository.updateStatus(id, status)
	}
}
