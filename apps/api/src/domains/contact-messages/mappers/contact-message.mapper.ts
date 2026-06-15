import {
	ContactMessageStatus as PrismaContactMessageStatus,
	type ContactMessage as PrismaContactMessage,
} from '@retrouve-ci/database'

import type { ContactMessage } from '../models/contact-message.model'
import type { ContactMessageStatus } from '../types/contact-message.types'

export function toDomainContactMessage(
	contactMessage: PrismaContactMessage,
): ContactMessage {
	return {
		id: contactMessage.id,
		name: contactMessage.name,
		email: contactMessage.email,
		subject: contactMessage.subject,
		message: contactMessage.message,
		status: toDomainStatus(contactMessage.status),
		createdAt: contactMessage.createdAt,
		readAt: contactMessage.readAt,
	}
}

export function toPrismaStatus(
	status: ContactMessageStatus,
): PrismaContactMessageStatus {
	switch (status) {
		case 'new':
			return PrismaContactMessageStatus.NEW
		case 'read':
			return PrismaContactMessageStatus.READ
		case 'archived':
			return PrismaContactMessageStatus.ARCHIVED
	}
}

export function toDomainStatus(
	status: PrismaContactMessageStatus,
): ContactMessageStatus {
	switch (status) {
		case PrismaContactMessageStatus.NEW:
			return 'new'
		case PrismaContactMessageStatus.READ:
			return 'read'
		case PrismaContactMessageStatus.ARCHIVED:
			return 'archived'
	}
}
