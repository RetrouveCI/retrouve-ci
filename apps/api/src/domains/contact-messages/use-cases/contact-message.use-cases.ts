import { Inject, Injectable } from '@nestjs/common'
import { ContactMessageNotFoundError } from '../errors/contact-message.errors'
import type {
	ContactMessage,
	ContactMessageListResponse,
} from '../models/contact-message.model'
import {
	CONTACT_MESSAGE_REPOSITORY,
	type ContactMessageRepository,
} from '../repository/contact-message.repository'
import type {
	ContactMessageStatus,
	CreateContactMessageData,
	ListContactMessagesFilter,
} from '../types/contact-message.types'

@Injectable()
export class ContactMessageUseCases {
	constructor(
		@Inject(CONTACT_MESSAGE_REPOSITORY)
		private readonly contactMessageRepository: ContactMessageRepository,
	) {}

	async create(data: CreateContactMessageData): Promise<ContactMessage> {
		return this.contactMessageRepository.create(data)
	}

	async getById(id: string): Promise<ContactMessage> {
		const contactMessage = await this.contactMessageRepository.findById(id)

		if (!contactMessage) {
			throw new ContactMessageNotFoundError(id)
		}

		return contactMessage
	}

	async list(
		filter: ListContactMessagesFilter,
	): Promise<ContactMessageListResponse> {
		return this.contactMessageRepository.list(filter)
	}

	async getOne(id: string): Promise<ContactMessage> {
		const contactMessage = await this.getById(id)

		if (contactMessage.status === 'new') {
			return this.contactMessageRepository.updateStatus(id, 'read')
		}

		return contactMessage
	}

	async updateStatus(
		id: string,
		status: ContactMessageStatus,
	): Promise<ContactMessage> {
		await this.getById(id)

		return this.contactMessageRepository.updateStatus(id, status)
	}
}
