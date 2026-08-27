import { z } from 'zod'
import { calendarDateSchema } from '../shared/calendar-date'

const eventDateSchema = calendarDateSchema({
	required: 'La date est requise',
	invalid: 'Date invalide',
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
