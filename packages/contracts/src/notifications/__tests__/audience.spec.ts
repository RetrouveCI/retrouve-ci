import { describe, expect, it } from 'vitest'
import {
	ADMIN_NOTIFICATION_TYPES,
	NOTIFICATION_TYPES,
	USER_NOTIFICATION_TYPES,
} from '../notifications.const'
import { audienceOf } from '../type.schema'

// ⚠️ Covers completeness, NOT classification: `audienceOf` derives from these
// same tables, so moving a type between them keeps every case green. The
// compiler holds the classification, at each producer. Measured.
describe('the audience a type belongs to', () => {
	it('covers every type exactly once', () => {
		expect(
			[...ADMIN_NOTIFICATION_TYPES, ...USER_NOTIFICATION_TYPES].sort(),
		).toEqual([...NOTIFICATION_TYPES].sort())
	})

	it('puts none of them on both sides', () => {
		const both = ADMIN_NOTIFICATION_TYPES.filter(type =>
			(USER_NOTIFICATION_TYPES as readonly string[]).includes(type),
		)

		expect(both).toEqual([])
	})

	it.each(ADMIN_NOTIFICATION_TYPES)('reads %s as the desk', type => {
		expect(audienceOf(type)).toBe('admin')
	})

	it.each(USER_NOTIFICATION_TYPES)('reads %s as a visitor', type => {
		expect(audienceOf(type)).toBe('user')
	})

	// The regression that would actually hurt, and the one thing here a table
	// swap cannot hide: these three shipped, and a visitor is receiving them.
	it.each(['match_found', 'qr_scan', 'stickers_delivered'] as const)(
		'leaves %s on the visitor side, as it shipped',
		type => {
			expect(audienceOf(type)).toBe('user')
		},
	)
})
