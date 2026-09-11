import { describe, expect, it } from 'vitest'
import { messageSearchClause } from '../contact-message.repository'

const contains = { contains: 'konan', mode: 'insensitive' }

describe('messageSearchClause', () => {
	it('adds nothing when there is no search', () => {
		expect(messageSearchClause(undefined)).toEqual({})
		expect(messageSearchClause('')).toEqual({})
	})

	it('looks through the sender, their e-mail and the subject, case aside', () => {
		expect(messageSearchClause('konan')).toEqual({
			OR: [{ name: contains }, { email: contains }, { subject: contains }],
		})
	})
})
