import { z } from 'zod'

// The admin form posts what `datetime-local` produces (`2026-09-01T18:30`), so
// the seconds and the offset an ISO instant carries are both optional here.
const ISO_DATE_TIME =
	/^\d{4}-\d{2}-\d{2}(?:[T ]\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:?\d{2})?)?$/

function isCalendarDateTime(value: string): boolean {
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

const eventDateSchema = z
	.string()
	.trim()
	.superRefine((value, ctx) => {
		if (!value) {
			ctx.addIssue({ code: 'custom', message: 'La date est requise' })
			return
		}

		if (!isCalendarDateTime(value)) {
			ctx.addIssue({ code: 'custom', message: 'Date invalide' })
		}
	})

export const createEventSchema = z.object({
	title: z
		.string()
		.trim()
		.min(3, 'Le titre doit contenir au moins 3 caractères')
		.max(120, 'Maximum 120 caractères'),
	description: z
		.string()
		.trim()
		.min(10, 'La description doit contenir au moins 10 caractères')
		.max(2000, 'Maximum 2000 caractères'),
	location: z
		.string()
		.trim()
		.min(2, 'Veuillez indiquer le lieu')
		.max(200, 'Maximum 200 caractères'),
	ville: z
		.string()
		.trim()
		.min(2, 'Veuillez indiquer la ville')
		.max(120, 'Maximum 120 caractères'),
	commune: z.string().trim().max(120, 'Maximum 120 caractères').optional(),
	eventDate: eventDateSchema,
})

export type CreateEventInput = z.input<typeof createEventSchema>
export type CreateEventData = z.output<typeof createEventSchema>
