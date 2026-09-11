import type { SessionAudience } from '@/shared/auth/session-audience'
import { ListingThreadForbiddenError } from '../errors/listing-comment.errors'
import type { ThreadScope } from '../types/listing-comment.types'

interface ThreadCaller {
	id: string
	role?: string | null
}

/**
 * The app asking decides the side, not the role: an administrator is also an
 * ordinary user, and on the public app a poster. The desk side needs the role
 * as well, because nothing stops an ordinary account from signing in to the
 * backoffice's instance.
 */
export function threadScope(
	audience: SessionAudience,
	caller: ThreadCaller,
): ThreadScope {
	if (audience === 'public') return { side: 'owner', userId: caller.id }

	if (isAdmin(caller.role)) return { side: 'admin' }

	throw new ListingThreadForbiddenError()
}

function isAdmin(role: string | null | undefined): boolean {
	return (role ?? '').split(',').some(value => value.trim() === 'admin')
}
