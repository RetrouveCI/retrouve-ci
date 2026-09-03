import { z } from 'zod'
import { documentTypeSchema, type DocumentType } from './enums.schema'
import {
	BANK_CARD_DIGITS,
	MAX_DOCUMENT_NUMBER_LENGTH,
	MIN_DESCRIPTION_LENGTH,
} from './lost-items.const'

/**
 * All four fields are optional, and deliberately **not** tied to the
 * `documents` category: a wallet handed in with a CNI inside is the most common
 * find of all, and its category is `wallet`.
 */
export const documentFieldsShape = {
	documentType: documentTypeSchema.optional(),
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
}

export interface DocumentFields {
	documentType?: DocumentType
	documentHolderName?: string
	documentNumber?: string
	documentIssuer?: string
}

const BANK_CARD_LAST_DIGITS = new RegExp(`^\\d{${BANK_CARD_DIGITS}}$`)

/** A form posts an empty string for a field left alone. */
function given(value: string | undefined): boolean {
	return value !== undefined && value.length > 0
}

/** A piece of ID, once it names both its type and its holder. */
export function describesDocument(fields: DocumentFields): boolean {
	return fields.documentType !== undefined && given(fields.documentHolderName)
}

/** `requireHolderName` is off on an update: the row may already carry it. */
export function documentFieldIssues(
	fields: DocumentFields,
	{ requireHolderName }: { requireHolderName: boolean },
): [keyof DocumentFields, string][] {
	const issues: [keyof DocumentFields, string][] = []

	const opened =
		fields.documentType !== undefined ||
		given(fields.documentNumber) ||
		given(fields.documentIssuer)

	// The name is what the matching runs on: a number with nobody attached
	// matches nothing and is an identity fragment kept for no purpose.
	if (requireHolderName && opened && !given(fields.documentHolderName)) {
		issues.push([
			'documentHolderName',
			'Le nom du titulaire est requis pour une pièce',
		])
	}

	// The PAN would drag PCI-DSS into a service that has no use for it.
	const number = fields.documentNumber ?? ''

	if (
		fields.documentType === 'bank_card' &&
		number.length > 0 &&
		!BANK_CARD_LAST_DIGITS.test(number)
	) {
		issues.push([
			'documentNumber',
			`Pour une carte bancaire, indiquez seulement les ${BANK_CARD_DIGITS} derniers chiffres`,
		])
	}

	return issues
}

/**
 * The description floor lives here too, because whether it applies depends on
 * these fields: the shape carries no `min` of its own any more.
 */
export function pushLostItemWriteIssues(
	ctx: {
		value: DocumentFields & { description?: string }
		issues: z.core.$ZodRawIssue[]
	},
	options: { requireHolderName: boolean },
): void {
	const push = (path: keyof DocumentFields | 'description', message: string) =>
		ctx.issues.push({ code: 'custom', message, input: ctx.value, path: [path] })

	for (const [path, message] of documentFieldIssues(ctx.value, options)) {
		push(path, message)
	}

	const { description } = ctx.value

	if (
		description !== undefined &&
		description.length < MIN_DESCRIPTION_LENGTH &&
		!describesDocument(ctx.value)
	) {
		push(
			'description',
			`La description doit contenir au moins ${MIN_DESCRIPTION_LENGTH} caractères`,
		)
	}
}
