import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/infrastructures/database/prisma.service'
import {
	toDomainContactMessage,
	toPrismaStatus,
} from '../mappers/contact-message.mapper'
import type {
	ContactMessage,
	ContactMessageListResponse,
} from '../models/contact-message.model'
import type {
	ContactMessageStatus,
	CreateContactMessageData,
	ListContactMessagesFilter,
} from '../types/contact-message.types'
import type { ContactMessageRepository } from './contact-message.repository'
import { toPaginated, toPrismaPage } from '@/shared/utils/pagination.util'

@Injectable()
export class ContactMessageRepositoryService
	implements ContactMessageRepository
{
	constructor(private readonly prisma: PrismaService) {}

	async create(data: CreateContactMessageData): Promise<ContactMessage> {
		const contactMessage = await this.prisma.contactMessage.create({
			data: {
				name: data.name,
				email: data.email,
				phone: data.phone,
				subject: data.subject,
				message: data.message,
				qrTokenCode: data.qrTokenCode,
				recipientUserId: data.recipientUserId,
			},
		})

		return toDomainContactMessage(contactMessage)
	}

	async findById(id: string): Promise<ContactMessage | null> {
		const contactMessage = await this.prisma.contactMessage.findUnique({
			where: { id },
		})

		return contactMessage ? toDomainContactMessage(contactMessage) : null
	}

	async list(
		filter: ListContactMessagesFilter,
	): Promise<ContactMessageListResponse> {
		const where = {
			...(filter.status && { status: toPrismaStatus(filter.status) }),
		}

		const [items, total] = await Promise.all([
			this.prisma.contactMessage.findMany({
				where,
				orderBy: { createdAt: 'desc' },
				...toPrismaPage(filter),
			}),
			this.prisma.contactMessage.count({ where }),
		])

		return toPaginated(items.map(toDomainContactMessage), total, filter)
	}

	async updateStatus(
		id: string,
		status: ContactMessageStatus,
	): Promise<ContactMessage> {
		const contactMessage = await this.prisma.contactMessage.update({
			where: { id },
			data: {
				status: toPrismaStatus(status),
				...(status === 'read' && { readAt: new Date() }),
			},
		})

		return toDomainContactMessage(contactMessage)
	}
}
