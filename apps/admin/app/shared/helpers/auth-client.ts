import { adminClient } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'

/** The backoffice has its own better-auth instance, hence its own session cookie. */
export const authClient = createAuthClient({
	baseURL: `${import.meta.env.VITE_API_URL}/api/admin-auth`,
	plugins: [adminClient()],
})
