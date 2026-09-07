import { redirect } from 'react-router'
import { requireAdminSession } from '@/shared/helpers/session.server'
import { getUserById } from '../../servers/users.service'

export async function userLoader({
	request,
	params,
}: {
	request: Request
	params: { id?: string }
}) {
	await requireAdminSession(request)

	const user = await getUserById(request, params.id ?? '')
	if (!user) throw redirect('/users')

	return { user }
}
