import { data } from 'react-router'
import type { Route } from '../+types/_index'
import { ApiError } from '@/shared/utils/api-fetch'
import { getLostItemById } from '../../servers/lost-items.service'
import { toLostItemDetail } from '@/shared/mappers/lost-item.mapper'

/** What `contact.action` sends back when the jump could not be made. */
export type ContactOutcome = 'failed' | 'throttled'

const CONTACT_OUTCOMES: ContactOutcome[] = ['failed', 'throttled']

function contactOutcomeOf(request: Request): ContactOutcome | null {
	const value = new URL(request.url).searchParams.get('contact')

	return CONTACT_OUTCOMES.find(outcome => outcome === value) ?? null
}

export async function postDetailLoader({ params, request }: Route.LoaderArgs) {
	try {
		const dto = await getLostItemById(params.id, request)

		return {
			listing: toLostItemDetail(dto),
			contact: contactOutcomeOf(request),
		}
	} catch (err) {
		if (err instanceof ApiError && err.status === 404) {
			throw data(null, { status: 404 })
		}
		throw err
	}
}
