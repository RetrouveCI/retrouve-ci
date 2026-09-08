import {
	NotificationAudience as PrismaNotificationAudience,
	NotificationType as PrismaNotificationType,
} from '@app/database'
import {
	NOTIFICATION_AUDIENCES,
	NOTIFICATION_TYPES,
} from '@app/contracts/notifications'
import { describe, expect, it } from 'vitest'
import {
	toDomainAudience,
	toDomainNotification,
	toDomainType,
	toPrismaAudience,
	toPrismaType,
} from '../notification.mapper'

describe('notification mapper', () => {
	it('maps a Prisma Notification to the domain model', () => {
		const prismaNotification = {
			id: 'notification-1',
			type: PrismaNotificationType.MATCH_FOUND,
			audience: PrismaNotificationAudience.USER,
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
			audience: 'user',
			title: 'Correspondance trouvée',
			message: 'Un objet correspondant à votre annonce a été trouvé',
			link: '/posts/lost-item-1',
			read: false,
			userId: 'user-1',
			createdAt: new Date('2026-01-01'),
			readAt: null,
		})
	})

	// A desk row carries no owner, and the mapper must carry the null through
	// rather than inventing one.
	it('keeps a desk notification ownerless', () => {
		const mapped = toDomainNotification({
			id: 'notification-desk-1',
			type: PrismaNotificationType.LISTING_PENDING,
			audience: PrismaNotificationAudience.ADMIN,
			title: 'Une annonce attend la modération',
			message: 'x',
			link: '/posts',
			read: false,
			userId: null,
			createdAt: new Date('2026-01-01'),
			readAt: null,
		})

		expect(mapped.userId).toBeNull()
		expect(mapped.audience).toBe('admin')
	})
})

// The property neither package can hold alone, and the api is the one place
// both enums are visible: the two lists must be the same set, spelling aside.
describe('the contract against the database', () => {
	it('has the same types on both sides', () => {
		expect(
			[...NOTIFICATION_TYPES].map(type => type.toUpperCase()).sort(),
		).toEqual(Object.values(PrismaNotificationType).sort())
	})

	it('has the same audiences on both sides', () => {
		expect(
			[...NOTIFICATION_AUDIENCES]
				.map(audience => audience.toUpperCase())
				.sort(),
		).toEqual(Object.values(PrismaNotificationAudience).sort())
	})

	it.each(NOTIFICATION_TYPES)('maps %s both ways', type => {
		expect(toDomainType(toPrismaType(type))).toBe(type)
	})

	it.each(NOTIFICATION_AUDIENCES)(
		'maps the %s audience both ways',
		audience => {
			expect(toDomainAudience(toPrismaAudience(audience))).toBe(audience)
		},
	)
})
