import { NotificationAudience as PrismaNotificationAudience } from '@app/database'
import { NOTIFICATION_AUDIENCES } from '@app/contracts/notifications'
import { describe, expect, it } from 'vitest'
import type { NotificationScope } from '../../types/notification.types'
import { whereFor } from '../notification.repository'

const VISITOR: NotificationScope = { audience: 'user', userId: 'user-1' }
const DESK: NotificationScope = { audience: 'admin' }

// Everything above only passes a scope down, and would keep passing it down if
// this clause stopped naming an audience. So it is asserted here.
describe('the clause every notification read is built from', () => {
	it('scopes a visitor to their own rows', () => {
		expect(whereFor(VISITOR)).toEqual({
			audience: PrismaNotificationAudience.USER,
			userId: 'user-1',
		})
	})

	// `userId: null` is not decoration: without it the desk's clause would match
	// an administrator's own visitor rows as well.
	it('scopes the desk to rows that belong to nobody', () => {
		expect(whereFor(DESK)).toEqual({
			audience: PrismaNotificationAudience.ADMIN,
			userId: null,
		})
	})

	it.each([VISITOR, DESK])('names an audience for %j', scope => {
		expect(whereFor(scope).audience).toBeDefined()
	})

	// Both directions, so neither clause can widen into the other.
	it('gives the two scopes different audiences', () => {
		expect(whereFor(VISITOR).audience).not.toBe(whereFor(DESK).audience)
	})

	it('covers every audience the contract declares', () => {
		const built = [whereFor(VISITOR).audience, whereFor(DESK).audience]

		expect(built.sort()).toEqual(
			[...NOTIFICATION_AUDIENCES].map(a => a.toUpperCase()).sort(),
		)
	})
})
