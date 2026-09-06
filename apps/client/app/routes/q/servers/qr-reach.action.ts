import { redirect } from 'react-router'
import { reachOwnerSchema } from '@app/contracts/qr-codes'
import { ApiError } from '@/shared/utils/api-fetch'
import { reachQrOwner } from './qr-contact.service'

const TOO_MANY_REQUESTS = 429

/**
 * The buttons post here with `reloadDocument`, so the browser performs the jump
 * itself and the page they left never held the number. Measured: Chromium
 * follows a `https://wa.me/…` and hands a `tel:…` to the system dialer, leaving
 * the page untouched where no dialer answers.
 */
export async function action({
	request,
	params,
}: {
	request: Request
	params: { code: string }
}) {
	const back = `/q/${params.code}`
	const submission = reachOwnerSchema.safeParse(
		Object.fromEntries(await request.formData()),
	)

	if (!submission.success) return redirect(`${back}?reach=failed`)

	try {
		return redirect(await reachQrOwner(params.code, submission.data.channel))
	} catch (error) {
		// Back to the contact screen, whose message form still works. Only the
		// throttle is named apart, being the one worth waiting out.
		if (error instanceof ApiError && error.status === TOO_MANY_REQUESTS) {
			return redirect(`${back}?reach=throttled`)
		}

		return redirect(`${back}?reach=failed`)
	}
}
