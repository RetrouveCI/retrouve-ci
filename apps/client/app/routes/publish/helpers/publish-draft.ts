import { documentTypeSchema } from '@app/contracts/lost-items'
import type { PublishFormInput } from '../publish.schema'

const STORAGE_KEY = 'retrouveci.publish-draft.v1'

/**
 * The eleven free-text fields the form owns. Photos are deliberately absent:
 * they live in real `<input type="file">` elements, and a `File` handle dies
 * with the page it was picked in — no storage can bring one back.
 */
const DRAFT_TEXT_FIELDS = [
	'title',
	'objectType',
	'description',
	'ville',
	'commune',
	'date',
	'name',
	'whatsapp',
	'documentHolderName',
	'documentNumber',
	'documentIssuer',
] as const

/** Every other field holds free text; this one holds a closed enum. */
const DRAFT_FIELDS = [...DRAFT_TEXT_FIELDS, 'documentType'] as const

export interface PublishDraft {
	values: Partial<PublishFormInput>
	step: number
}

function asRecord(value: unknown): Record<string, unknown> | null {
	if (typeof value !== 'object' || value === null || Array.isArray(value)) {
		return null
	}

	return Object.fromEntries(Object.entries(value))
}

/** True once anything has been typed — an untouched form stores nothing. */
export function hasDraftContent(values: Partial<PublishFormInput>): boolean {
	return DRAFT_FIELDS.some(field => {
		const value = values[field]

		return typeof value === 'string' && value.trim() !== ''
	})
}

/**
 * Everything here comes back from a store the user can edit, so every field is
 * re-checked rather than trusted: a draft written by an older build, or by
 * hand, must read as absent instead of reaching `useForm` as a wrong shape.
 */
export function readPublishDraft(stepCount: number): PublishDraft | null {
	let raw: string | null

	try {
		raw = localStorage.getItem(STORAGE_KEY)
	} catch {
		return null
	}

	if (raw === null) return null

	let parsed: unknown

	try {
		parsed = JSON.parse(raw)
	} catch {
		return null
	}

	const stored = asRecord(parsed)
	if (!stored) return null

	const storedValues = asRecord(stored.values)
	if (!storedValues) return null

	const values: Partial<PublishFormInput> = {}

	for (const field of DRAFT_TEXT_FIELDS) {
		const value = storedValues[field]
		if (typeof value === 'string') values[field] = value
	}

	// A stored type the contract no longer knows must read as « nothing chosen »
	// rather than reach the `Select` as a value it cannot show.
	const documentType = documentTypeSchema.safeParse(storedValues.documentType)
	if (documentType.success) values.documentType = documentType.data

	if (!hasDraftContent(values)) return null

	const step = stored.step

	return {
		values,
		step:
			typeof step === 'number' && Number.isInteger(step) && step >= 1
				? Math.min(step, stepCount)
				: 1,
	}
}

export function writePublishDraft(draft: PublishDraft): void {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(draft))
	} catch {
		return
	}
}

export function clearPublishDraft(): void {
	try {
		localStorage.removeItem(STORAGE_KEY)
	} catch {
		return
	}
}
