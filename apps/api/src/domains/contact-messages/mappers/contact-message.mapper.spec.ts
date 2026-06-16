import { ContactMessageStatus as PrismaContactMessageStatus } from '@retrouve-ci/database'
import { describe, expect, it } from 'vitest'
import {
	toDomainContactMessage,
	toDomainStatus,
	toPrismaStatus,
} from './contact-message.mapper'

describe('contact-message mapper', () => {
	it('maps a Prisma ContactMessage to the domain model', () => {
		const prismaContactMessage = {
			id: 'message-1',
			name: 'Konan Yao',
			email: 'konan@example.ci',
			phone: null,
			subject: 'Question sur un sticker',
			message: 'Bonjour, comment puis-je commander un sticker ?',
			status: PrismaContactMessageStatus.NEW,
			qrTokenCode: null,
			recipientUserId: null,
			createdAt: new Date('2026-01-01'),
			readAt: null,
		}

		expect(toDomainContactMessage(prismaContactMessage)).toEqual({
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
		})
	})

	it.each([
		['new', PrismaContactMessageStatus.NEW],
		['read', PrismaContactMessageStatus.READ],
		['archived', PrismaContactMessageStatus.ARCHIVED],
	] as const)(
		'maps domain status %s to/from Prisma status',
		(domain, prisma) => {
			expect(toPrismaStatus(domain)).toBe(prisma)
			expect(toDomainStatus(prisma)).toBe(domain)
		},
	)
})
