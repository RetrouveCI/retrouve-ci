import { z } from 'zod'

// A form posts what its input produces: `date` gives `2026-09-01`,
// `datetime-local` gives `2026-09-01T18:30`. Neither carries the seconds and
// the offset `z.iso.datetime()` demands, so the shape is checked here instead.
const ISO_DATE_TIME =
	/^\d{4}-\d{2}-\d{2}(?:[T ]\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:?\d{2})?)?$/

export function isCalendarDateTime(value: string): boolean {
	if (!ISO_DATE_TIME.test(value) || Number.isNaN(Date.parse(value))) {
		return false
	}

	// The regex fixes the `YYYY-MM-DD` head, so these slices are exact. Rebuilding
	// the day is what rejects the 31 February the parser would roll over.
	const year = Number(value.slice(0, 4))
	const month = Number(value.slice(5, 7))
	const day = Number(value.slice(8, 10))
	const date = new Date(Date.UTC(year, month - 1, day))

	return (
		date.getUTCFullYear() === year &&
		date.getUTCMonth() === month - 1 &&
		date.getUTCDate() === day
	)
}

export interface CalendarDateMessages {
	required: string
	invalid: string
}

export function calendarDateSchema({
	required,
	invalid,
}: CalendarDateMessages) {
	return z
		.string()
		.trim()
		.superRefine((value, ctx) => {
			if (!value) {
				ctx.addIssue({ code: 'custom', message: required })
				return
			}

			if (!isCalendarDateTime(value)) {
				ctx.addIssue({ code: 'custom', message: invalid })
			}
		})
}
