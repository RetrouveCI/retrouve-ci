import { STICKER_ORDER_STATUSES } from '@app/contracts/sticker-orders'
import { describe, expect, it } from 'vitest'
import {
	MAX_OPEN_STICKER_ORDERS,
	OPEN_STICKER_ORDER_STATUSES,
	SETTLED_STICKER_ORDER_STATUSES,
} from '../constants'

// A status added to the contract must land on one side. Without this it counts
// as settled by omission, and orders in it could be stacked without limit.
describe('open against settled orders', () => {
	it('covers every status the contract declares', () => {
		expect(
			[
				...OPEN_STICKER_ORDER_STATUSES,
				...SETTLED_STICKER_ORDER_STATUSES,
			].sort(),
		).toEqual([...STICKER_ORDER_STATUSES].sort())
	})

	it('puts none of them on both sides', () => {
		const both = OPEN_STICKER_ORDER_STATUSES.filter(status =>
			SETTLED_STICKER_ORDER_STATUSES.includes(status),
		)

		expect(both).toEqual([])
	})

	// The two that end an order, and the reason the count is of what is open:
	// only these mean nothing more is owed to or by the customer.
	it('settles on delivery and on cancellation, and nothing else', () => {
		expect([...SETTLED_STICKER_ORDER_STATUSES].sort()).toEqual([
			'cancelled',
			'delivered',
		])
	})

	it('leaves room for a real customer to re-order', () => {
		expect(MAX_OPEN_STICKER_ORDERS).toBeGreaterThan(1)
	})
})
