import { describe, expect, it } from 'vitest'
import { EVENT_STATUSES } from '../events.const'
import { eventStatusSchema } from '../status.schema'

describe('eventStatusSchema', () => {
	it.each(EVENT_STATUSES)('accepts %s', status => {
		expect(eventStatusSchema.safeParse(status).success).toBe(true)
	})

	it('refuses an unknown status, in French', () => {
		const result = eventStatusSchema.safeParse('supprime')

		expect(result.success).toBe(false)
		expect(result.error?.issues[0]?.message).toBe('Statut invalide')
	})
})
