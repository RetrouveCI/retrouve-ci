import { data } from 'react-router'
import { ApiError } from '@/shared/utils/api-fetch'
import { getQrTokenPublicView } from './qr-contact.service'

/** What `qr-reach.action` sends back when the jump could not be made. */
export type ReachOutcome = 'failed' | 'throttled'

const REACH_OUTCOMES: ReachOutcome[] = ['failed', 'throttled']

function reachOutcomeOf(request: Request): ReachOutcome | null {
	const value = new URL(request.url).searchParams.get('reach')

	return REACH_OUTCOMES.find(outcome => outcome === value) ?? null
}

export async function qrContactLoader({
	request,
	params,
}: {
	request: Request
	params: { code: string }
}) {
	try {
		const token = await getQrTokenPublicView(params.code)
		return { token, reach: reachOutcomeOf(request) }
	} catch (err) {
		if (err instanceof ApiError && err.status === 404) {
			throw data(null, { status: 404 })
		}
		throw err
	}
}
