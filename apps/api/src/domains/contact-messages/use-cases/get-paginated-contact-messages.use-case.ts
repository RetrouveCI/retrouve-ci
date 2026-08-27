import { Injectable } from '@nestjs/common'
import type { IDomainUseCase } from '@/shared/types/domain-use-case.type'
import { ContactMessageRepository } from '../repository/contact-message.repository'
import type {
	ContactMessageListResponse,
	ListContactMessagesFilter,
} from '../types/contact-message.types'

@Injectable()
export class GetPaginatedContactMessagesUseCase implements IDomainUseCase<
	ListContactMessagesFilter,
	ContactMessageListResponse
> {
	constructor(private readonly repository: ContactMessageRepository) {}

	async execute(
		filter: ListContactMessagesFilter,
	): Promise<ContactMessageListResponse> {
		return this.repository.list(filter)
	}
}
