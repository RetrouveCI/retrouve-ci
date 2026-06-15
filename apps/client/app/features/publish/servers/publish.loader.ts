import { redirect } from 'react-router'
import { getServerSession } from '@/shared/auth/auth.server'

export async function publishLoader({ request }: { request: Request }) {
	const session = await getServerSession(request)
	if (!session) throw redirect('/auth')
	return null
}
