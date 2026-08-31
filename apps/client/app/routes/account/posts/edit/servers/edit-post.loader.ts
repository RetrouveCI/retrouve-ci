import { redirect } from 'react-router'
import { requireServerSession } from '@/shared/helpers/session.server'
import { getMyLostItems } from '../../servers/account-posts.service'

export async function editPostLoader(request: Request, id: string) {
	await requireServerSession(request)

	const items = await getMyLostItems(request)
	const item = items.find(i => i.id === id)

	if (!item) throw redirect('/account/posts')

	return { item }
}
