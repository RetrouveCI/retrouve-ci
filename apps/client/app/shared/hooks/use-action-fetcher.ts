import type { FieldErrors, FieldValues } from 'react-hook-form'
import { useFetcher } from 'react-router'

/**
 * Thin wrapper over `useFetcher` for actions that answer the
 * `{ success, errors }` contract. `errors` comes back shaped as react-hook-form
 * `FieldErrors`, so a form hands it straight to `useForm`'s `errors:` option and
 * server-side messages land on the fields they belong to.
 *
 * Pass a `key` when two instances of the same form can be mounted at once (a
 * create dialog and a row-level edit dialog, say): without one they would share
 * a single fetcher and each other's errors.
 */
export function useActionFetcher<
	TAction,
	TFormInput extends FieldValues = FieldValues,
>(key?: string) {
	const fetcher = useFetcher<TAction>({ key })

	const record = (
		typeof fetcher.data === 'object' && fetcher.data !== null
			? fetcher.data
			: undefined
	) as Record<string, unknown> | undefined

	return {
		data: fetcher.data,
		isOk: record?.success === true && fetcher.state === 'idle',
		errors: record?.errors as FieldErrors<TFormInput> | undefined,
		isSubmitting: fetcher.state !== 'idle',
		submit: fetcher.submit,
		Form: fetcher.Form,
		state: fetcher.state,
	}
}
