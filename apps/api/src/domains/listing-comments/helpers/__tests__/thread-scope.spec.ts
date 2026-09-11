import { describe, expect, it } from 'vitest'
import { ListingThreadForbiddenError } from '../../errors/listing-comment.errors'
import { threadScope } from '../thread-scope'

describe('threadScope', () => {
	// An administrator is also an ordinary user: on the public app, a poster.
	it('makes a poster of anyone on the public app, an administrator included', () => {
		expect(threadScope('public', { id: 'admin-1', role: 'admin' })).toEqual({
			side: 'owner',
			userId: 'admin-1',
		})
	})

	it('gives the desk to an administrator on the backoffice', () => {
		expect(threadScope('admin', { id: 'admin-1', role: 'admin' })).toEqual({
			side: 'admin',
		})
	})

	it('reads a role list the way the session guard does', () => {
		expect(
			threadScope('admin', { id: 'admin-1', role: 'user, admin' }),
		).toEqual({ side: 'admin' })
	})

	// Every visitor holds a password account, and nothing stops one from signing
	// in to the backoffice's instance with it. The audience alone proves nothing.
	it.each([null, undefined, 'user', 'administrator'])(
		'refuses the desk to a backoffice session whose role is %s',
		role => {
			expect(() => threadScope('admin', { id: 'user-1', role })).toThrow(
				ListingThreadForbiddenError,
			)
		},
	)
})
