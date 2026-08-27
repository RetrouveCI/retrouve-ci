import { phoneNumberClient } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'
import { apiUrl } from './env'

export const authClient = createAuthClient({
	baseURL: apiUrl(),
	plugins: [phoneNumberClient()],
})
