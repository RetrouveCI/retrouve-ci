import { describe, expect, it } from 'vitest'
import { toPaginated, toPrismaPage } from '../pagination.util'

describe('toPrismaPage', () => {
	// The offset the six repositories each computed by hand.
	it.each([
		[1, 20, 0, 20],
		[2, 20, 20, 20],
		[3, 15, 30, 15],
		[10, 1, 9, 1],
	])('page %i of %i reads as skip %i take %i', (page, pageSize, skip, take) => {
		expect(toPrismaPage({ page, pageSize })).toEqual({ skip, take })
	})

	it('never asks Prisma for a negative offset on the first page', () => {
		expect(toPrismaPage({ page: 1, pageSize: 50 }).skip).toBe(0)
	})
})

describe('toPaginated', () => {
	it('echoes the page it was asked for alongside the items', () => {
		expect(toPaginated(['a', 'b'], 7, { page: 2, pageSize: 2 })).toEqual({
			items: ['a', 'b'],
			total: 7,
			page: 2,
			pageSize: 2,
		})
	})

	it('carries an empty page without inventing a total', () => {
		expect(toPaginated([], 0, { page: 1, pageSize: 20 })).toEqual({
			items: [],
			total: 0,
			page: 1,
			pageSize: 20,
		})
	})
})
