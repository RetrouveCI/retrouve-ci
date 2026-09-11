import { describe, expect, it } from 'vitest'
import { qrSearchClause } from '../qr-token.repository'

const contains = { contains: 'rci-7k', mode: 'insensitive' }

describe('qrSearchClause', () => {
	it('adds nothing when there is no search', () => {
		expect(qrSearchClause(undefined)).toEqual({})
		expect(qrSearchClause('')).toEqual({})
	})

	it('looks through the code, the label and the batch, case aside', () => {
		expect(qrSearchClause('rci-7k')).toEqual({
			OR: [{ code: contains }, { label: contains }, { batch: contains }],
		})
	})
})
