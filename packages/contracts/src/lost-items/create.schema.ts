import { z } from 'zod'
import { calendarDateSchema } from '../shared/calendar-date'
import {
	ASSIGNABLE_PHONE_ERROR_MESSAGE,
	isAssignableLocalNumber,
	toE164,
} from '../shared/phone'
import { lostItemCategorySchema, lostItemTypeSchema } from './enums.schema'
import {
	MAX_DESCRIPTION_LENGTH,
	MAX_PHOTOS,
	MIN_DESCRIPTION_LENGTH,
} from './lost-items.const'

export const lostItemEventDateSchema = calendarDateSchema({
	required: 'La date est requise',
	invalid: 'Date invalide',
})

// The poster types the number however they like — bare, spaced, or already
// carrying the country code. Normalising here is what stops `+225` being
// prefixed onto a number that already had it.
export const contactWhatsappSchema = z
	.string()
	.trim()
	.refine(isAssignableLocalNumber, ASSIGNABLE_PHONE_ERROR_MESSAGE)
	.transform(toE164)

export const createLostItemSchema = z.object({
	type: lostItemTypeSchema,
	category: lostItemCategorySchema,
	title: z
		.string()
		.trim()
		.min(3, 'Le titre doit contenir au moins 3 caractères')
		.max(120, 'Maximum 120 caractères'),
	description: z
		.string()
		.trim()
		.min(
			MIN_DESCRIPTION_LENGTH,
			`La description doit contenir au moins ${MIN_DESCRIPTION_LENGTH} caractères`,
		)
		.max(
			MAX_DESCRIPTION_LENGTH,
			`Maximum ${MAX_DESCRIPTION_LENGTH} caractères`,
		),
	ville: z
		.string()
		.trim()
		.min(2, 'Veuillez indiquer la ville')
		.max(120, 'Maximum 120 caractères'),
	commune: z.string().trim().max(120, 'Maximum 120 caractères').optional(),
	eventDate: lostItemEventDateSchema,
	contactName: z
		.string()
		.trim()
		.min(2, 'Veuillez indiquer votre nom')
		.max(120, 'Maximum 120 caractères'),
	contactWhatsapp: contactWhatsappSchema,
	photos: z
		.array(z.string().trim().min(1, 'Photo invalide'))
		.max(MAX_PHOTOS, `Vous ne pouvez pas ajouter plus de ${MAX_PHOTOS} photos`)
		.optional(),
})

export type CreateLostItemInput = z.input<typeof createLostItemSchema>
export type CreateLostItemData = z.output<typeof createLostItemSchema>
