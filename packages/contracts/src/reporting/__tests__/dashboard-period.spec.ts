import { describe, expect, it } from 'vitest'
import {
	DEFAULT_DASHBOARD_PERIOD_DAYS,
	dashboardPeriodSchema,
	resolvePeriod,
} from '../dashboard-period.schema'

const DAY_MS = 24 * 60 * 60 * 1000
const NOW = new Date('2026-09-11T15:30:00.000Z')
const days = (a: Date, b: Date) =>
	Math.round((b.getTime() - a.getTime()) / DAY_MS)

describe('dashboardPeriodSchema', () => {
	it('accepts a day at each bound', () => {
		expect(
			dashboardPeriodSchema.parse({ from: '2026-06-17', to: '2026-06-18' }),
		).toEqual({ from: '2026-06-17', to: '2026-06-18' })
	})

	it('accepts naming neither', () => {
		expect(dashboardPeriodSchema.parse({})).toEqual({})
	})

	// The rule `calendarDateSchema` carries: a day that does not exist is not a
	// date, whatever `Date.parse` would roll it over to.
	it.each(['2026-02-31', 'hier', '17/06/2026'])('refuses %s', from => {
		const result = dashboardPeriodSchema.safeParse({ from })

		expect(result.success).toBe(false)
		expect(result.error?.issues[0]?.message).toBe('Date de début invalide')
	})
})

describe('resolvePeriod', () => {
	it('reads no bound as the last thirty days', () => {
		const { from, to } = resolvePeriod({}, NOW)

		expect(days(from, to)).toBe(DEFAULT_DASHBOARD_PERIOD_DAYS)
		// Through the end of today, so what happened this morning counts.
		expect(to.getTime()).toBeGreaterThan(NOW.getTime())
	})

	// ⚠️ The reference is the same length immediately before. Comparing a week
	// to a fixed thirty days is what makes a « +8 % » mean nothing.
	it('compares against a window of the same length, immediately before', () => {
		const { from, to, previousFrom } = resolvePeriod(
			{ from: '2026-06-17', to: '2026-06-18' },
			NOW,
		)

		expect(days(from, to)).toBe(2)
		expect(days(previousFrom, from)).toBe(2)
		expect(previousFrom.getTime()).toBeLessThan(from.getTime())
	})

	it.each([1, 7, 30, 90, 365])('holds for a %d-day window', length => {
		const start = new Date('2026-01-01T00:00:00.000Z')
		const end = new Date(start.getTime() + (length - 1) * DAY_MS)
		const period = {
			from: start.toISOString().slice(0, 10),
			to: end.toISOString().slice(0, 10),
		}

		const { from, to, previousFrom } = resolvePeriod(period, NOW)

		expect(days(from, to)).toBe(length)
		expect(days(previousFrom, from)).toBe(length)
	})

	// The last day counts in full: a period ending « today » must not stop at
	// midnight and drop everything that happened since.
	it('runs to the end of its last day', () => {
		const { to } = resolvePeriod({ from: '2026-06-17', to: '2026-06-18' }, NOW)

		expect(to.toISOString().slice(0, 10)).toBe('2026-06-19')
		expect(to.getHours()).toBe(0)
	})

	// A picker can hand back a range the other way round; that is a gesture, not
	// an error, and refusing it would empty the dashboard for no reason.
	it('reads bounds given backwards in the order meant', () => {
		const forwards = resolvePeriod(
			{ from: '2026-06-17', to: '2026-06-18' },
			NOW,
		)
		const backwards = resolvePeriod(
			{ from: '2026-06-18', to: '2026-06-17' },
			NOW,
		)

		expect(backwards.from.getTime()).toBe(forwards.from.getTime())
		expect(backwards.to.getTime()).toBe(forwards.to.getTime())
	})

	it('reads one bound alone', () => {
		const { from, to } = resolvePeriod({ to: '2026-06-18' }, NOW)

		expect(days(from, to)).toBe(DEFAULT_DASHBOARD_PERIOD_DAYS)
		expect(to.toISOString().slice(0, 10)).toBe('2026-06-19')
	})
})
