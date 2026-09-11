import { describe, expect, it } from 'vitest'
import { orderSearchClause } from '../sticker-order.repository'

const contains = { contains: 'yopougon', mode: 'insensitive' }

describe('orderSearchClause', () => {
	it('adds nothing when there is no search', () => {
		expect(orderSearchClause(undefined)).toEqual({})
		expect(orderSearchClause('')).toEqual({})
	})

	it('looks through the number, the town and the address, case aside', () => {
		expect(orderSearchClause('yopougon')).toEqual({
			OR: [
				{ orderNumber: contains },
				{ deliveryCity: contains },
				{ deliveryAddress: contains },
			],
		})
	})
})
