import { hasRole } from '@/shared/auth/has-role'
import type { SessionAudience } from '@/shared/auth/session-audience'
import { DeskNotificationsForbiddenError } from '../errors/notification.errors'
import type { NotificationScope } from '../types/notification.types'

interface NotificationReader {
	id: string
	role?: string | null
}

/**
 * The backoffice reads the desk's, the public app the caller's own. Neither is
 * asked for in a query string. The desk needs the role as well: every visitor
 * holds a password account, and nothing refuses one signing in to the
 * backoffice's instance with it — the audience alone proves nothing.
 */
export function notificationScope(
	audience: SessionAudience,
	reader: NotificationReader,
): NotificationScope {
	if (audience === 'public') return { audience: 'user', userId: reader.id }

	if (hasRole(reader.role, ['admin'])) return { audience: 'admin' }

	throw new DeskNotificationsForbiddenError()
}
