import { describe, expect, it } from 'vitest'
import { REACH_CHANNELS, reachOwnerSchema } from '../reach.schema'

describe('reachOwnerSchema', () => {
	it.each(REACH_CHANNELS)('accepts the %s channel', channel => {
		expect(reachOwnerSchema.parse({ channel })).toEqual({ channel })
	})

	// A bare `z.enum` reports its rejection in English.
	it.each(['sms', 'email', '', undefined])('refuses %o in French', channel => {
		const result = reachOwnerSchema.safeParse({ channel })

		expect(result.success).toBe(false)
		expect(result.error?.issues[0]?.message).toBe(
			'Choisissez un moyen de contact valide',
		)
	})
})
