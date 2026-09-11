import { z } from 'zod'
import {
	DOCUMENT_TYPE_ERROR,
	MAX_DESCRIPTION_LENGTH,
	MAX_DOCUMENT_NUMBER_LENGTH,
	documentTypeSchema,
	lostItemCategorySchema,
	lostItemTypeSchema,
	postedForSchema,
	pushLostItemWriteIssues,
} from '@app/contracts/lost-items'
import {
	ASSIGNABLE_PHONE_ERROR_MESSAGE,
	calendarDateSchema,
	isAssignableLocalNumber,
} from '@app/contracts/shared'

/**
 * The same rules as the public form, under the contract's own field names — the
 * backoffice has no reason to rename them. What a form adds and an API body does
 * not is the « nothing chosen yet » state of each `Select`, spelled out and
 * folded back to absent. Photos are files, not fields: the action reads them
 * apart, and `refusesPhotos` decides whether it uploads any.
 */
const newPostFields = z.object({
	type: lostItemTypeSchema,
	category: z
		.string({ error: 'Choisissez une catégorie' })
		.min(1, 'Choisissez une catégorie')
		.pipe(lostItemCategorySchema),
	title: z
		.string({ error: 'Le titre est requis' })
		.trim()
		.min(3, 'Le titre doit contenir au moins 3 caractères')
		.max(120, 'Maximum 120 caractères'),
	description: z
		.string({ error: 'La description est requise' })
		.trim()
		.max(
			MAX_DESCRIPTION_LENGTH,
			`Maximum ${MAX_DESCRIPTION_LENGTH} caractères`,
		),
	ville: z
		.string({ error: 'Sélectionnez une ville' })
		.trim()
		.min(2, 'Sélectionnez une ville')
		.max(120, 'Maximum 120 caractères'),
	commune: z.string().trim().max(120, 'Maximum 120 caractères').optional(),
	eventDate: calendarDateSchema({
		required: 'Indiquez la date',
		invalid: 'Date invalide',
	}),
	contactName: z
		.string({ error: 'Le nom affiché est requis' })
		.trim()
		.min(2, 'Le nom affiché est requis')
		.max(120, 'Maximum 120 caractères'),
	contactWhatsapp: z
		.string({ error: 'Le numéro WhatsApp est requis' })
		.trim()
		.refine(isAssignableLocalNumber, ASSIGNABLE_PHONE_ERROR_MESSAGE),
	documentType: z
		.union([z.literal(''), documentTypeSchema], { error: DOCUMENT_TYPE_ERROR })
		.optional()
		.transform(value => value || undefined),
	documentHolderName: z
		.string()
		.trim()
		.max(120, 'Maximum 120 caractères')
		.optional(),
	documentNumber: z
		.string()
		.trim()
		.max(
			MAX_DOCUMENT_NUMBER_LENGTH,
			`Maximum ${MAX_DOCUMENT_NUMBER_LENGTH} caractères`,
		)
		.optional(),
	documentIssuer: z
		.string()
		.trim()
		.max(120, 'Maximum 120 caractères')
		.optional(),
	postedFor: postedForSchema,
})

export const newPostSchema = newPostFields.check(ctx =>
	pushLostItemWriteIssues(ctx, { requireHolderName: true }),
)

export type NewPostInput = z.input<typeof newPostSchema>
export type NewPostData = z.output<typeof newPostSchema>
