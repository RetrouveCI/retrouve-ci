import { describe, expect, it } from 'vitest'
import { NOTIFICATION_TYPES } from '../notifications.const'
import { notificationTypeSchema } from '../type.schema'

describe('notificationTypeSchema', () => {
	// Frozen so the list changes only on purpose. That it matches the Prisma enum
	// is asserted in the api, the one place both are visible.
	it('covers every type the database can hold', () => {
		expect(NOTIFICATION_TYPES).toEqual([
			'match_found',
			'qr_scan',
			'stickers_delivered',
			'listing_pending',
			'listing_moderated',
			'listing_contacted',
			'order_placed',
			'contact_received',
			'order_processing',
			'order_shipped',
			'order_cancelled',
			'listing_commented',
			'listing_replied',
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
