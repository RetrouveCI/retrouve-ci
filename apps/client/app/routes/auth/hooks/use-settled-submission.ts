import { useEffect, useRef } from 'react'
import type { ActionResult } from '@/shared/types/action'

/**
 * Runs `onSettled` once for each answer an action returns, handing it that
 * answer.
 *
 * Two traps, both measured against the running app. The obvious guard — a flag
 * raised beside `fetcher.submit()`, read together with `state === 'idle'` — is
 * wrong twice over: `submit()` does not leave `idle` inside the batch that
 * calls it, so the flag is already true on a render where nothing has been
 * asked; and latching on the `submitting` render instead misses answers, that
 * render not being guaranteed. React Router hands back a new `response` object
 * per settled submission, so its identity is the honest signal.
 *
 * The second trap is why the answer is passed in rather than read back off the
 * fetcher: `isOk` means "succeeded **and** idle", and the fetcher is not yet
 * idle when its answer lands. Reading it here turned every successful reset
 * into "Code incorrect ou expiré". What settled is what decides.
 */
export function useSettledSubmission(
	response: ActionResult | undefined,
	onSettled: (result: ActionResult) => void,
) {
	const handled = useRef<ActionResult | undefined>(undefined)
	const settle = useRef(onSettled)
	settle.current = onSettled

	useEffect(() => {
		if (response === undefined || response === handled.current) return

		handled.current = response
		settle.current(response)
	}, [response])
}
