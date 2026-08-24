import { vi } from 'vitest'
import type { ContactMessageRepository } from '../repository/contact-message.repository'
import type { ContactMessage } from '../types/contact-message.types'

export function buildContactMessage(
	overrides: Partial<ContactMessage> = {},
): ContactMessage {
	return {
		id: 'message-1',
		name: 'Konan Yao',
		email: 'konan@example.ci',
		phone: null,
		subject: 'Question sur un sticker',
		message: 'Bonjour, comment puis-je commander un sticker ?',
		status: 'new',
		qrTokenCode: null,
		recipientUserId: null,
		createdAt: new Date('2026-01-01'),
		readAt: null,
		...overrides,
	}
}

/**
 * The repository is a concrete class now, with no interface to stand in for it,
 * so a test double is a partial cast rather than a structural match.
 */
export function buildRepository(): ContactMessageRepository {
	return {
		create: vi.fn(),
		findById: vi.fn(),
		list: vi.fn(),
		updateStatus: vi.fn(),
	} as unknown as ContactMessageRepository
}
