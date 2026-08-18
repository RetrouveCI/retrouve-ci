import type { FieldError } from 'react-hook-form'

/**
 * Adapts react-hook-form's error object to the `errors?: string[]` contract the
 * auth step components and `FieldError` (`@app/ui/components/form`) still speak.
 *
 * Temporary by design: it disappears the day those components move to the
 * shadcn `Field` family, which takes the error objects directly. Keeping the
 * contract as-is is what makes E7.2 a pure engine swap, with no change to the
 * rendered markup — see MIGRATION-PLAN-CLIENT.md §4.3.1.
 */
export function toErrorList(
	error: FieldError | undefined,
): string[] | undefined {
	return error?.message ? [error.message] : undefined
}
