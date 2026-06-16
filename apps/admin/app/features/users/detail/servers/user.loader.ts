import { redirect } from 'react-router'
import { requireAdminSession } from '@/shared/auth/auth.server'
import { getUserById } from '../../servers/users.service'

export async function userLoader({
	request,
	params,
}: {
	request: Request
	params: { id?: string }
}) {
	await requireAdminSession(request)

	const cookie = request.headers.get('cookie') ?? ''
	const user = await getUserById(cookie, params.id ?? '')
	if (!user) throw redirect('/users')

	return { user }
}
