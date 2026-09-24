import { describe, expect, it } from 'vitest'
import { dateRangeWhere, toDateRange } from '../date-range.util'

describe('toDateRange', () => {
	it('opens the lower bound on its day', () => {
		expect(
			toDateRange({ dateFrom: '2026-09-15' }).dateFrom?.toISOString(),
		).toBe('2026-09-15T00:00:00.000Z')
	})

	/**
	 * The half that breaks in silence. `2026-09-15` parses to midnight, so a raw
	 * `lte` drops every row of the 15th — and the list is not empty, only
	 * incomplete, which nobody reports.
	 */
	it('closes the upper bound on its day', () => {
		expect(toDateRange({ dateTo: '2026-09-15' }).dateTo?.toISOString()).toBe(
			'2026-09-15T23:59:59.999Z',
		)
	})

	it('holds a row filed at the very end of the last day', () => {
		const { dateTo } = toDateRange({ dateTo: '2026-09-15' })
		const lastMoment = new Date('2026-09-15T23:59:59.000Z')

		expect(dateTo!.getTime()).toBeGreaterThanOrEqual(lastMoment.getTime())
	})

	// A `datetime-local` field posts a time as well; the bound still names a day.
	it('reads the day out of a bound that carries a time', () => {
		expect(
			toDateRange({ dateFrom: '2026-09-15T18:30' }).dateFrom?.toISOString(),
		).toBe('2026-09-15T00:00:00.000Z')
	})

	it('answers nothing for a bound that is not there', () => {
		expect(toDateRange({})).toEqual({})
	})
})

describe('dateRangeWhere', () => {
	// Spread into a `where`, so an absent range must add no key at all rather
	// than an empty object Prisma would read as a constraint.
	it('is undefined when neither bound is set', () => {
		expect(dateRangeWhere({})).toBeUndefined()
	})

	it.each([
		['the lower one alone', { dateFrom: new Date(0) }, ['gte']],
		['the upper one alone', { dateTo: new Date(0) }, ['lte']],
		['both', { dateFrom: new Date(0), dateTo: new Date(1) }, ['gte', 'lte']],
	])('carries %s', (_, range, keys) => {
		expect(Object.keys(dateRangeWhere(range)!)).toEqual(keys)
	})
})
