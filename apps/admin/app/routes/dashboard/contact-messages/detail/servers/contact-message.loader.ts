import { requireAdminSession } from '@/shared/helpers/session.server'
import { getContactMessageById } from '../../servers/contact-messages.service'

/** Reading a new message marks it read on the API: opening the page is the signal. */
export async function contactMessageLoader({
	request,
	params,
}: {
	request: Request
	params: { id: string }
}) {
	await requireAdminSession(request)

	return { message: await getContactMessageById(params.id, request) }
}
