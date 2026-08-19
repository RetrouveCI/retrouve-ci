import { redirect } from 'react-router'
import type { ActionResult } from '@/shared/types/action'
import { ApiError } from './api-fetch'

const DEFAULT_API_ERROR_MESSAGE = 'Une erreur est survenue. Veuillez réessayer.'

interface ApiOperationOptions {
	redirectOnUnauthorized?: string
}

export async function withApiOperationError(
	fn: () => Promise<unknown>,
	{ redirectOnUnauthorized }: ApiOperationOptions = {},
): Promise<ActionResult> {
	try {
		await fn()
		return { success: true }
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

export function getApiErrorMessage(
	error: ApiError,
	fallbackMessage: string = DEFAULT_API_ERROR_MESSAGE,
): string {
	return error.message || fallbackMessage
}
