/**
 * A calendar day is not an instant. `2026-09-15` parses to `00:00:00.000`, so a
 * raw `lte` on the upper bound **excludes the whole last day** — and it does it
 * in silence: the list is not empty, only incomplete, which is the kind of
 * wrong nobody reports. The lower bound opens its day, the upper one closes it.
 *
 * Only the `YYYY-MM-DD` head is read, so a bound that came from a
 * `datetime-local` field is treated as the day it names.
 */
export interface DateRange {
	dateFrom?: Date
	dateTo?: Date
}

export interface CalendarRange {
	dateFrom?: string
	dateTo?: string
}

export function toDateRange({ dateFrom, dateTo }: CalendarRange): DateRange {
	return {
		...(dateFrom && {
			dateFrom: new Date(`${dateFrom.slice(0, 10)}T00:00:00.000Z`),
		}),
		...(dateTo && {
			dateTo: new Date(`${dateTo.slice(0, 10)}T23:59:59.999Z`),
		}),
	}
}

/** The Prisma clause for a column, or nothing at all when neither bound is set. */
export function dateRangeWhere({ dateFrom, dateTo }: DateRange) {
	if (!dateFrom && !dateTo) return undefined

	return {
		...(dateFrom && { gte: dateFrom }),
		...(dateTo && { lte: dateTo }),
	}
}

/**
 * A query filter once its two calendar strings have become instants. Declaring
 * it here is what makes the conversion boundary explicit: a repository that
 * receives one of these has had `toDateRange` applied, and a controller that
 * forgets it does not compile.
 */
export type WithDateRange<T> = Omit<T, 'dateFrom' | 'dateTo'> & DateRange
