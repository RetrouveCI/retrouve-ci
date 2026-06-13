import { NotificationType as PrismaNotificationType } from '@retrouve-ci/database'
import { describe, expect, it } from 'vitest'
import {
	toDomainNotification,
	toDomainType,
	toPrismaType,
} from './notification.mapper'

describe('notification mapper', () => {
	it('maps a Prisma Notification to the domain model', () => {
		const prismaNotification = {
			id: 'notification-1',
			type: PrismaNotificationType.MATCH_FOUND,
			title: 'Correspondance trouvée',
			message: 'Un objet correspondant à votre annonce a été trouvé',
			link: '/posts/lost-item-1',
			read: false,
			userId: 'user-1',
			createdAt: new Date('2026-01-01'),
			readAt: null,
		}

		expect(toDomainNotification(prismaNotification)).toEqual({
			id: 'notification-1',
			type: 'match_found',
			title: 'Correspondance trouvée',
			message: 'Un objet correspondant à votre annonce a été trouvé',
			link: '/posts/lost-item-1',
			read: false,
			userId: 'user-1',
			createdAt: new Date('2026-01-01'),
			readAt: null,
		})
	})

	it.each([['match_found', PrismaNotificationType.MATCH_FOUND]] as const)(
		'maps type %s both ways',
		(domain, prisma) => {
			expect(toPrismaType(domain)).toBe(prisma)
			expect(toDomainType(prisma)).toBe(domain)
		},
	)
})
