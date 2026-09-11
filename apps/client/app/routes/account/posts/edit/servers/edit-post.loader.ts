import { redirect } from 'react-router'
import { requireServerSession } from '@/shared/helpers/session.server'
import {
	getListingThread,
	getMyLostItems,
} from '../../servers/account-posts.service'

export async function editPostLoader(request: Request, id: string) {
	await requireServerSession(request)

	// `null` when the API refuses: a thread that cannot be read is not empty.
	const [items, thread] = await Promise.all([
		getMyLostItems(request),
		getListingThread(id, request).catch(() => null),
	])
	const item = items.find(i => i.id === id)

	if (!item) throw redirect('/account/posts')

	return { item, thread }
}
