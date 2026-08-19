import type { FieldErrors, FieldValues } from 'react-hook-form'
import { useFetcher } from 'react-router'

/**
 * Thin wrapper over `useFetcher` for actions that answer the
 * `{ success, errors }` contract. `errors` comes back shaped as react-hook-form
 * `FieldErrors`, so a form hands it straight to `useForm`'s `errors:` option and
 * server-side messages land on the fields they belong to.
 *
 * A `key` is **not** needed to keep two forms apart: `useFetcher` falls back to
 * `useId()`, so every call already owns its own fetcher — verified against the
 * five settings dialogs, which post to one action and stay independent without
 * one. Pass a key only to share a single fetcher's state between components, or
 * to keep it alive across an unmount.
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
