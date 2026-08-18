import { useEffect, useRef } from 'react'
import { useFetcher } from 'react-router'

/**
 * Shape every `servers/*.action.ts` returns today: a boolean outcome plus an
 * optional message. Actions that report per-field errors (`publish`,
 * `account/posts/edit`) still reply with Conform's `submission.reply()`; the
 * bridge feeding those back into react-hook-form's `errors` option belongs to
 * the PR that migrates them.
 */
export interface ActionResult {
	ok: boolean
	error?: string
}

interface UseActionFetcherOptions {
	onOk?: (result: ActionResult) => void
	onError?: (result: ActionResult) => void
}

/**
 * Wraps `useFetcher` and runs `onOk` / `onError` exactly once per response.
 *
 * `fetcher.data` survives its own submission, so the hand-rolled
 * `useEffect(… fetcher.state, fetcher.data)` this replaces had to guard against
 * re-entering on every unrelated re-render — usually with an extra piece of
 * state and an `exhaustive-deps` escape hatch. Comparing the response identity
 * removes both.
 */
export function useActionFetcher(options: UseActionFetcherOptions = {}) {
	const fetcher = useFetcher<ActionResult>()

	// Declared before the settle effect so the callbacks are already refreshed
	// when it runs in the same commit.
	const optionsRef = useRef(options)
	useEffect(() => {
		optionsRef.current = options
	})

	const handledRef = useRef<ActionResult | null>(null)

	useEffect(() => {
		if (fetcher.state !== 'idle') return

		const result = fetcher.data
		if (!result || handledRef.current === result) return
		handledRef.current = result

		if (result.ok) optionsRef.current.onOk?.(result)
		else optionsRef.current.onError?.(result)
	}, [fetcher.state, fetcher.data])

	return {
		submit: fetcher.submit,
		data: fetcher.data,
		isSubmitting: fetcher.state !== 'idle',
	}
}
