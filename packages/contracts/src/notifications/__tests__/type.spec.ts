import { describe, expect, it } from 'vitest'
import { NOTIFICATION_TYPES } from '../notifications.const'
import { notificationTypeSchema } from '../type.schema'

describe('notificationTypeSchema', () => {
	// The API's own constant listed `match_found` alone, while its mapper and the
	// Prisma enum both carry `qr_scan`. The contract is the complete list.
	it('covers every type the database can hold', () => {
		expect(NOTIFICATION_TYPES).toEqual([
			'match_found',
			'qr_scan',
			'stickers_delivered',
		])
	})

	it.each(NOTIFICATION_TYPES)('accepts %s', type => {
		expect(notificationTypeSchema.safeParse(type).success).toBe(true)
	})

	it('refuses an unknown type, in French', () => {
		const result = notificationTypeSchema.safeParse('sticker_scanne')

		expect(result.success).toBe(false)
		expect(result.error?.issues[0]?.message).toBe(
			'Type de notification invalide',
		)
	})
})
