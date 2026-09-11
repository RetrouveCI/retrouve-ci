import { describe, expect, it } from 'vitest'
import { DeskNotificationsForbiddenError } from '../../errors/notification.errors'
import { notificationScope } from '../notification-scope'

describe('notificationScope', () => {
	// An administrator is also an ordinary user, and reads their own bell there.
	it('reads the caller’s own on the public app, whatever their role', () => {
		expect(
			notificationScope('public', { id: 'admin-1', role: 'admin' }),
		).toEqual({ audience: 'user', userId: 'admin-1' })
	})

	it('reads the desk’s for an administrator on the backoffice', () => {
		expect(
			notificationScope('admin', { id: 'admin-1', role: 'admin' }),
		).toEqual({ audience: 'admin' })
	})

	it('reads a role list the way the session guard does', () => {
		expect(
			notificationScope('admin', { id: 'admin-1', role: 'user, admin' }),
		).toEqual({ audience: 'admin' })
	})

	// The hole this closes: a visitor signed in to the backoffice's instance with
	// their own password read the desk's work queue.
	it.each([null, undefined, 'user'])(
		'refuses the desk to a backoffice session whose role is %j',
		role => {
			expect(() => notificationScope('admin', { id: 'user-1', role })).toThrow(
				DeskNotificationsForbiddenError,
			)
		},
	)
})
