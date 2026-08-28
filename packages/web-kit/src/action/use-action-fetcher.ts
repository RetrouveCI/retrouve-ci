import type { FieldErrors, FieldValues } from 'react-hook-form'
import { useFetcher } from 'react-router'

/**
 * Thin wrapper over `useFetcher` for actions that answer the
 * `{ success, data?, errors? }` contract. `errors` comes back shaped as
 * react-hook-form `FieldErrors`, so a form hands it straight to `useForm`'s
 * `errors:` option and server-side messages land on the fields they belong to.
 *
 * `data` is the action's payload, not the raw response, and it is only readable
 * once the submission has settled successfully — a form reacting to it therefore
 * never sees the previous run's value. Name the payload type through `TData` to
 * get it typed; it stays `undefined` otherwise.
 *
 * `response` is the raw answer object, exposed for one purpose: React Router
 * hands back a new one per settled submission, so its identity is the only
 * reliable way to run an effect once per answer. Neither `state` nor a flag
 * raised beside `submit()` can do that job — `submit()` does not leave `idle`
 * inside the batch that calls it, and the `submitting` render is not guaranteed
 * to happen at all.
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
	TData = never,
>(key?: string) {
	const fetcher = useFetcher<TAction>({ key })

	const record = (
		typeof fetcher.data === 'object' && fetcher.data !== null
			? fetcher.data
			: undefined
	) as Record<string, unknown> | undefined

	const isOk = record?.success === true && fetcher.state === 'idle'

	return {
		data: isOk ? (record?.data as TData | undefined) : undefined,
		response: fetcher.data,
		isOk,
		errors: record?.errors as FieldErrors<TFormInput> | undefined,
		isSubmitting: fetcher.state !== 'idle',
		submit: fetcher.submit,
		Form: fetcher.Form,
		state: fetcher.state,
	}
}
