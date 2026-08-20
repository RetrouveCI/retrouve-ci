import { z } from 'zod'
import type { ActionResult, FormErrors } from '@/shared/types/action'

/**
 * Turn a `ZodError` into the error map an action sends back. Issues that belong
 * to no field land on `root`.
 */
export function zodErrorToFieldErrors(
	error: z.ZodError,
): FormErrors | undefined {
	const { fieldErrors, formErrors } = z.flattenError(error) as {
		fieldErrors: Record<string, string[]>
		formErrors: string[]
	}

	const errors: FormErrors = {}

	for (const [name, messages] of Object.entries(fieldErrors)) {
		if (messages?.[0]) {
			errors[name] = { type: 'custom', message: messages[0] }
		}
	}

	if (formErrors?.[0]) {
		errors.root = { type: 'custom', message: formErrors[0] }
	}

	return Object.keys(errors).length ? errors : undefined
}

/**
 * Failures that belong to no field — an unknown intent, a missing id, a value
 * that is not a form input — are reported on `root`, which is where a form
 * renders them through `FormRootError`.
 */
export function rootError(message: string): ActionResult {
	return { success: false, errors: { root: { type: 'custom', message } } }
}
