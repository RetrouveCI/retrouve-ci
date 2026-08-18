import { useEffect, useRef } from 'react'
import { useFetcher } from 'react-router'

export interface ActionResult {
	ok: boolean
	error?: string
}

interface UseActionFetcherOptions {
	onOk?: (result: ActionResult) => void
	onError?: (result: ActionResult) => void
}

export function useActionFetcher(options: UseActionFetcherOptions = {}) {
	const fetcher = useFetcher<ActionResult>()

	// Must stay declared before the settle effect, so the callbacks are already
	// refreshed when it runs in the same commit.
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
