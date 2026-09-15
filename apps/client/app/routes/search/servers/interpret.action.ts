import { redirect } from 'react-router'
import type { AssistantSearchFilters } from '@app/contracts/search-assistant'
import { ApiError } from '@/shared/utils/api-fetch'
import { looksLikePhrase } from '../helpers/phrase'
import {
	ASSISTANT_PARAM,
	PHRASE_PARAM,
	type AssistantOutcome,
} from '../search.const'
import { interpretSearchPhrase } from './interpret.service'

const TOO_MANY_REQUESTS = 429
const POSTS = '/posts'

// No component means no error boundary, so a GET here would be served **as the
// page**: React Router answers `400 {"message":"Unexpected Server Error"}`.
// A reload, a restore or a shared link all arrive that way.
export function loader() {
	return redirect(POSTS)
}

/**
 * The assistant answers a strict subset of the listing filters, so nothing is
 * translated on the way out but the one key `/posts` spells differently.
 */
function toSearchParams(filters: AssistantSearchFilters): URLSearchParams {
	const { search, ...rest } = filters
	const params = new URLSearchParams()

	if (search) params.set('q', search)

	for (const [key, value] of Object.entries(rest)) {
		if (value) params.set(key, value)
	}

	return params
}

/**
 * The phrase travels back in the URL so the banner can quote it — one does not
 * say « je n'ai pas compris » without naming what — but never as `q`: « j'ai
 * perdu ma carte d'identité à Cocody mardi » matches no title, and an empty
 * list would be a worse answer than the sentence itself. Only the `search` the
 * model narrowed becomes a text search.
 */
function landing(
	outcome: AssistantOutcome,
	phrase: string,
	params = new URLSearchParams(),
): Response {
	params.set(ASSISTANT_PARAM, outcome)
	params.set(PHRASE_PARAM, phrase)

	return redirect(`${POSTS}?${params.toString()}`)
}

export async function action({ request }: { request: Request }) {
	const form = await request.formData()
	const phrase = String(form.get(PHRASE_PARAM) ?? '').trim()

	// Not a sentence — « carte », « CNI Cocody ». The plain text search already
	// answers it, and no extraction is spent on what a filter does for free.
	if (!looksLikePhrase(phrase)) {
		if (!phrase) return redirect(POSTS)

		return redirect(`${POSTS}?${new URLSearchParams({ q: phrase }).toString()}`)
	}

	try {
		const { status, filters } = await interpretSearchPhrase(phrase, request)

		if (status !== 'interpreted') return landing('unavailable', phrase)

		const params = toSearchParams(filters)

		// An `interpreted` answer carrying nothing is the model reading the phrase
		// and finding no filter in it — a different thing to say from an outage.
		if ([...params.keys()].length === 0) return landing('empty', phrase)

		return landing('interpreted', phrase, params)
	} catch (error) {
		const throttled =
			error instanceof ApiError && error.status === TOO_MANY_REQUESTS

		return landing(throttled ? 'throttled' : 'unavailable', phrase)
	}
}
