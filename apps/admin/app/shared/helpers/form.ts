import { z } from 'zod'
import type { FormErrors } from '@/shared/types/action'

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
