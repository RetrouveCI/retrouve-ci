import { z } from 'zod'
import { calendarDateSchema } from '../shared/calendar-date'

/** The window the dashboard reads when the URL names none. */
export const DEFAULT_DASHBOARD_PERIOD_DAYS = 30

/**
 * The period the dashboard measures. Both bounds are optional: a backoffice
 * that names neither reads the last thirty days, which is the window the
 * figures were hard-coded to before they could be asked for.
 *
 * A date and not a datetime, because that is what a `date` input produces and
 * what an operator means — a day, not a moment.
 */
export const dashboardPeriodSchema = z.object({
	from: calendarDateSchema({
		required: 'Date de début requise',
		invalid: 'Date de début invalide',
	}).optional(),
	to: calendarDateSchema({
		required: 'Date de fin requise',
		invalid: 'Date de fin invalide',
	}).optional(),
})

export type DashboardPeriodInput = z.input<typeof dashboardPeriodSchema>
export type DashboardPeriodData = z.output<typeof dashboardPeriodSchema>

export interface ResolvedPeriod {
	from: Date
	/** Exclusive: the day after the last one measured. */
	to: Date
	/** Where the window of the same length immediately before it starts. */
	previousFrom: Date
}

const DAY_MS = 24 * 60 * 60 * 1000

/**
 * Turns what the URL carries into the three bounds every figure is measured
 * against. ⚠️ The reference window is the **same length**, immediately before:
 * comparing a week to a fixed thirty days is what makes a « +8 % » mean nothing.
 *
 * A period reads to the **end** of its last day, and a bound the other way
 * round is read in the order the operator meant rather than refused.
 */
export function resolvePeriod(
	period: DashboardPeriodData,
	now: Date = new Date(),
): ResolvedPeriod {
	// ⚠️ Ordered as **days**, before either bound is shifted. Swapping the
	// shifted moments instead collapses two adjacent days to nothing, because
	// the end of the 17th and the start of the 18th are the same instant.
	const [earlier, later] = orderedDays(period)

	const to = later ? endOfDay(later) : startOfDay(now, 1)
	const from = earlier
		? startOfDay(earlier)
		: new Date(to.getTime() - DEFAULT_DASHBOARD_PERIOD_DAYS * DAY_MS)

	return {
		from,
		to,
		previousFrom: new Date(from.getTime() - (to.getTime() - from.getTime())),
	}
}

/** A picker can hand a range back the other way round: that is a gesture. */
function orderedDays({
	from,
	to,
}: DashboardPeriodData): [string | undefined, string | undefined] {
	if (from && to && dayOf(from) > dayOf(to)) return [to, from]

	return [from, to]
}

const dayOf = (value: string) => value.slice(0, 10)

function startOfDay(value: Date | string, addDays = 0): Date {
	const date = new Date(value)
	date.setHours(0, 0, 0, 0)
	date.setDate(date.getDate() + addDays)
	return date
}

/** Exclusive, so the last day counts in full. */
function endOfDay(value: string): Date {
	return startOfDay(value, 1)
}
