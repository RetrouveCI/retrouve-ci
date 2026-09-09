import { redirect } from 'react-router'
import { ApiError } from '@/shared/utils/api-fetch'
import { contactLostItemPoster } from '../../servers/lost-items.service'

const TOO_MANY_REQUESTS = 429

// This route is the opened tab's own URL, so a reload arrives as a GET — which
// a resource route answered with a `400` JSON page. Measured.
export function loader({ params }: { params: { id: string } }) {
	return redirect(`/posts/${params.id}`)
}

// The bar posts here in its own tab. The API counts the contact in the same
// call, which is why `contactsCount` finally moves.
export async function action({
	request,
	params,
}: {
	request: Request
	params: { id: string }
}) {
	const back = `/posts/${params.id}`

	try {
		return redirect(await contactLostItemPoster(params.id, request))
	} catch (error) {
		// Only the throttle is named apart, being the one worth waiting out.
		if (error instanceof ApiError && error.status === TOO_MANY_REQUESTS) {
			return redirect(`${back}?contact=throttled`)
		}

		return redirect(`${back}?contact=failed`)
	}
}
