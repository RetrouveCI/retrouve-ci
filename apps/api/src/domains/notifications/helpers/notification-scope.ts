import type { SessionAudience } from '@/shared/auth/session-audience'
import type { NotificationScope } from '../types/notification.types'

// The backoffice reads the desk's, the public app the caller's own. Neither is
// asked for in a query string.
export function notificationScope(
	audience: SessionAudience,
	userId: string,
): NotificationScope {
	return audience === 'admin'
		? { audience: 'admin' }
		: { audience: 'user', userId }
}
