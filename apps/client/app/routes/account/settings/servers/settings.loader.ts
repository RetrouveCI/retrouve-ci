import { requireServerSession } from '@/shared/helpers/session.server'
import { toUserProfile } from '../mappers/profile.mapper'

export async function settingsLoader({ request }: { request: Request }) {
	const session = await requireServerSession(request)
	return { user: toUserProfile(session.user) }
}
