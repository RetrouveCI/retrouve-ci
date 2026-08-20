import { redirect } from 'react-router'
import type { ActionResult } from '@/shared/types/action'
import { ApiError } from './api-fetch'

const DEFAULT_API_ERROR_MESSAGE = 'Une erreur est survenue. Veuillez réessayer.'

interface ApiOperationOptions {
	redirectOnUnauthorized?: string
}

/**
 * Same contract as `withApiOperationError`, but the resolved value is sent back
 * to the form as `data`. Reach for it only when the form genuinely needs it —
 * revalidating the loader is the cheaper answer whenever the data lives
 * somewhere else too.
 */
export async function withApiOperationData<TData>(
	fn: () => Promise<TData>,
	{ redirectOnUnauthorized }: ApiOperationOptions = {},
): Promise<ActionResult<TData>> {
	try {
		return { success: true, data: await fn() }
	} catch (error) {
		if (error instanceof ApiError) {
			if (error.status === 401 && redirectOnUnauthorized) {
				throw redirect(redirectOnUnauthorized)
			}

			return {
				success: false,
				errors: {
					root: { type: 'custom', message: getApiErrorMessage(error) },
				},
			}
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
