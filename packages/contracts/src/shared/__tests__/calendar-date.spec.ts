import { describe, expect, it } from 'vitest'
import { calendarDateSchema, isCalendarDateTime } from '../calendar-date'

const schema = calendarDateSchema({
	required: 'La date est requise',
	invalid: 'Date invalide',
})

describe('isCalendarDateTime', () => {
	it.each([
		'2026-01-15',
		'2026-01-15T18:30',
		'2026-01-15 18:30',
		'2026-01-15T18:30:00',
		'2026-01-15T18:30:00.000Z',
		'2026-01-15T18:30:00+02:00',
		'2024-02-29',
	])('accepts %s', value => {
		expect(isCalendarDateTime(value)).toBe(true)
	})

	// `Date.parse` rolls these over to the first of the next month instead of
	// refusing them, which is why the day is rebuilt and compared.
	it.each(['2026-02-31', '2026-04-31', '2025-02-29', '2026-13-01'])(
		'refuses %s',
		value => {
			expect(isCalendarDateTime(value)).toBe(false)
		},
	)

	it.each(['15/01/2026', 'demain', '2026-1-5', '20260115'])(
		'refuses %s, which is not the ISO shape a form posts',
		value => {
			expect(isCalendarDateTime(value)).toBe(false)
		},
	)
})

describe('calendarDateSchema', () => {
	it('trims before validating', () => {
		expect(schema.safeParse('  2026-01-15  ').data).toBe('2026-01-15')
	})

	it('uses the required message for a blank, the invalid one otherwise', () => {
		expect(schema.safeParse('').error?.issues[0]?.message).toBe(
			'La date est requise',
		)
		expect(schema.safeParse('   ').error?.issues[0]?.message).toBe(
			'La date est requise',
		)
		expect(schema.safeParse('2026-02-31').error?.issues[0]?.message).toBe(
			'Date invalide',
		)
	})
})
