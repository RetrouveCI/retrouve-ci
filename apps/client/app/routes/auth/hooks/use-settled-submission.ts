import { useEffect, useRef } from 'react'

/**
 * Runs `onSettled` once for each answer an action returns.
 *
 * The obvious guard — a flag raised beside `fetcher.submit()`, read together
 * with `state === 'idle'` — is wrong twice over. `submit()` does not leave
 * `idle` inside the batch that calls it, so the flag is already true on a render
 * where nothing has been asked yet, and an `else` branch there reports a refusal
 * the API never sent. Latching on the `submitting` render instead fails the
 * other way: that render is not guaranteed to happen, and the answer is then
 * missed entirely.
 *
 * React Router hands back a new `response` object per settled submission, so its
 * identity is the one honest signal. Pass `fetcher.response`.
 */
export function useSettledSubmission(response: unknown, onSettled: () => void) {
	const handled = useRef<unknown>(undefined)
	const settle = useRef(onSettled)
	settle.current = onSettled

	useEffect(() => {
		if (response === undefined || response === handled.current) return

		handled.current = response
		settle.current()
	}, [response])
}
