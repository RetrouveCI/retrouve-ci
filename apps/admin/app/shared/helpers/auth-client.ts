import { adminClient } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'
import { apiUrl } from './env'

/** The backoffice has its own better-auth instance, hence its own session cookie. */
export const authClient = createAuthClient({
	baseURL: `${apiUrl()}/api/admin-auth`,
	plugins: [adminClient()],
})
