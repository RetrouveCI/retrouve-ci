import { redirect } from 'react-router'
import { ApiError } from '../api/api-error'
import type { ActionResult, FormErrors } from './action.types'

const DEFAULT_API_ERROR_MESSAGE = 'Une erreur est survenue. Veuillez réessayer.'

interface ApiOperationOptions {
	redirectOnUnauthorized?: string
	// Maps the API's field names onto the form's, and so says which fields the
	// form has. Needed only where they disagree; an unlisted name folds into
	// `root`, so no message disappears in silence.
	fields?: Record<string, string>
}

// The API's refusals, landed on the fields they belong to. What has no field —
// an unmapped name, or an error carrying none — stays on `root`.
function toFieldErrors(
	error: ApiError,
	fields?: Record<string, string>,
): FormErrors {
	const errors: FormErrors = {}
	const orphans: string[] = []

	for (const [name, messages] of Object.entries(error.fieldErrors)) {
		const message = messages.join(' ')
		if (!message) continue

		const target = fields ? fields[name] : name

		if (target) errors[target] = { type: 'server', message }
		else orphans.push(message)
	}

	// « Validation failed » is the envelope beside the map: it says nothing a
	// visitor can act on, so it survives only when the API named nothing.
	const named = Object.keys(errors).length > 0 || orphans.length > 0
	const rootMessage = named ? orphans.join(' ') : getApiErrorMessage(error)

	return {
		...errors,
		...(rootMessage && { root: { type: 'custom', message: rootMessage } }),
	}
}

/**
 * Same contract as `withApiOperationError`, but the resolved value is sent back
 * to the form as `data`. Reach for it only when the form genuinely needs it —
 * revalidating the loader is the cheaper answer whenever the data lives
 * somewhere else too.
 */
export async function withApiOperationData<TData>(
	fn: () => Promise<TData>,
	{ redirectOnUnauthorized, fields }: ApiOperationOptions = {},
): Promise<ActionResult<TData>> {
	try {
		return { success: true, data: await fn() }
	} catch (error) {
		if (error instanceof ApiError) {
			if (error.status === 401 && redirectOnUnauthorized) {
				throw redirect(redirectOnUnauthorized)
			}

			return { success: false, errors: toFieldErrors(error, fields) }
		}

		throw error
	}
}

export async function withApiOperationError(
	fn: () => Promise<unknown>,
	options: ApiOperationOptions = {},
): Promise<ActionResult> {
	const result = await withApiOperationData(fn, options)
	return result.success ? { success: true } : result
}

export function getApiErrorMessage(
	error: ApiError,
	fallbackMessage: string = DEFAULT_API_ERROR_MESSAGE,
): string {
	return error.message || fallbackMessage
}
