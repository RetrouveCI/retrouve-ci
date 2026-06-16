import { redirect } from 'react-router'
import { requireAdminSession } from '@/shared/auth/auth.server'
import { MOCK_USERS } from './users.loader'

export async function userLoader({
	request,
	params,
}: {
	request: Request
	params: { id?: string }
}) {
	await requireAdminSession(request)

	const user = MOCK_USERS.find((u) => u.id === params.id)
	if (!user) throw redirect('/users')

	return { user }
}
