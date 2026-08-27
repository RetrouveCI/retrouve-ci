import { z } from 'zod'
import {
	MAX_DESCRIPTION_LENGTH,
	MIN_DESCRIPTION_LENGTH,
	lostItemCategorySchema,
} from '@app/contracts/lost-items'
import {
	PHONE_ERROR_MESSAGE,
	calendarDateSchema,
	isValidLocalNumber,
} from '@app/contracts/shared'

/**
 * The publish form's own schema: it translates field names the contract does
 * not know (`objectType`, `date`, `name`, `whatsapp`) and adds the
 * "nothing selected yet" state a form has and an API body does not. The rules
 * themselves come from `@app/contracts/lost-items`.
 */
export const publishFormSchema = z.object({
	title: z
		.string({ error: 'Le titre est requis' })
		.min(3, 'Le titre doit contenir au moins 3 caractères')
		.max(120, 'Maximum 120 caractères'),
	// A `string` input piped into the contract's enum, so the form can start out
	// with no selection: the enum alone would call the empty initial value
	// invalid rather than missing.
	objectType: z
		.string({ error: "Sélectionnez un type d'objet" })
		.min(1, "Sélectionnez un type d'objet")
		.pipe(lostItemCategorySchema),
	description: z
		.string({ error: 'La description est requise' })
		.min(
			MIN_DESCRIPTION_LENGTH,
			`La description doit contenir au moins ${MIN_DESCRIPTION_LENGTH} caractères`,
		)
		.max(
			MAX_DESCRIPTION_LENGTH,
			`Maximum ${MAX_DESCRIPTION_LENGTH} caractères`,
		),
	ville: z
		.string({ error: 'Sélectionnez une ville' })
		.min(1, 'Sélectionnez une ville'),
	commune: z.string().optional(),
	date: calendarDateSchema({
		required: 'Indiquez la date',
		invalid: 'Date invalide',
	}),
	name: z
		.string({ error: 'Votre nom est requis' })
		.min(2, 'Votre nom est requis')
		.max(120, 'Maximum 120 caractères'),
	// The field shows a fixed `+225` and invites `07 XX XX XX XX`, so it holds a
	// local number and accepts the spacing the placeholder promises. The API
	// puts it in E.164 form; see `contactWhatsappSchema`.
	whatsapp: z
		.string({ error: 'Votre numéro WhatsApp est requis' })
		.trim()
		.refine(isValidLocalNumber, PHONE_ERROR_MESSAGE),
})

export type PublishFormInput = z.input<typeof publishFormSchema>
export type PublishFormData = z.output<typeof publishFormSchema>
