import type { FieldError } from 'react-hook-form'

export function toErrorList(
	error: FieldError | undefined,
): string[] | undefined {
	return error?.message ? [error.message] : undefined
}
