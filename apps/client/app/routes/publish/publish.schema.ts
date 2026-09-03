import { z } from 'zod'
import {
	DOCUMENT_TYPE_ERROR,
	MAX_DESCRIPTION_LENGTH,
	MAX_DOCUMENT_NUMBER_LENGTH,
	documentTypeSchema,
	lostItemCategorySchema,
	pushLostItemWriteIssues,
} from '@app/contracts/lost-items'
import {
	ASSIGNABLE_PHONE_ERROR_MESSAGE,
	calendarDateSchema,
	isAssignableLocalNumber,
} from '@app/contracts/shared'

/**
 * The publish form's own schema: it translates field names the contract does
 * not know (`objectType`, `date`, `name`, `whatsapp`) and adds the
 * "nothing selected yet" state a form has and an API body does not. The rules
 * themselves come from `@app/contracts/lost-items`.
 */
const publishFormFields = z.object({
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
	// No floor here: whether one applies depends on the document fields, so the
	// contract's own rule below owns it — see `pushLostItemWriteIssues`.
	description: z
		.string({ error: 'La description est requise' })
		.trim()
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
		.refine(isAssignableLocalNumber, ASSIGNABLE_PHONE_ERROR_MESSAGE),
	// A `Select` starts out on `''`, which no closed enum accepts, so the empty
	// choice is spelled out and folded back to « absent » on the way through.
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
})

const NO_DOCUMENT = {
	documentType: undefined,
	documentHolderName: undefined,
	documentNumber: undefined,
	documentIssuer: undefined,
}

/**
 * The block is only reachable under `documents`, so a piece left behind by a
 * category the poster then changed must not travel: it would carry a stranger's
 * name on an annonce nobody can see it in, floor exemption included.
 */
function underDeclaredCategory<T extends { objectType: string }>(values: T): T {
	return values.objectType === 'documents'
		? values
		: { ...values, ...NO_DOCUMENT }
}

/**
 * The description floor, the holder's name and the bank card's four digits are
 * the contract's rules, run here so the browser refuses what the API would.
 */
export const publishFormSchema = publishFormFields
	.transform(underDeclaredCategory)
	.check(ctx => pushLostItemWriteIssues(ctx, { requireHolderName: true }))

export type PublishFormInput = z.input<typeof publishFormSchema>
export type PublishFormData = z.output<typeof publishFormSchema>
