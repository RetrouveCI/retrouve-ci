import {
	createContext,
	useContext,
	useCallback,
	useMemo,
	type ReactNode,
} from 'react'
import { useNavigate } from 'react-router'
import type { User } from '@/shared/types/user'
import { authClient } from '@/shared/helpers/auth-client'
import { toE164 } from '@/shared/utils/phone'

const TEMP_EMAIL_SUFFIX = '@phone.retrouveci.local'

interface AuthContextType {
	user: User | null
	isAuthenticated: boolean
	isLoading: boolean
	login: (
		phone: string,
		password: string,
	) => Promise<{ success: boolean; error?: string }>
	logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
	const navigate = useNavigate()
	const session = authClient.useSession()

	// Same rule as `shared/helpers/session.server.ts`: a backoffice account is not
	// a user of this app. The API runs a single better-auth instance, so an admin
	// signed in on the backoffice would otherwise appear signed in here too.
	// `role` is not in the phone-number client's inferred user type — the `admin`
	// plugin lives on the server side only — hence the narrow read.
	const rawUser = session.data?.user
	const sessionUser =
		(rawUser as { role?: string } | undefined)?.role === 'admin'
			? undefined
			: rawUser

	const user: User | null = useMemo(
		() =>
			sessionUser
				? {
						id: sessionUser.id,
						phone: sessionUser.phoneNumber ?? '',
						name: sessionUser.name,
						email: sessionUser.email.endsWith(TEMP_EMAIL_SUFFIX)
							? undefined
							: sessionUser.email,
						createdAt: new Date(sessionUser.createdAt).toLocaleDateString(
							'fr-FR',
							{ day: 'numeric', month: 'long', year: 'numeric' },
						),
					}
				: null,
		[sessionUser],
	)

	const login = useCallback(
		async (
			phone: string,
			password: string,
		): Promise<{ success: boolean; error?: string }> => {
			const result = await authClient.signIn.phoneNumber({
				phoneNumber: toE164(phone),
				password,
			})

			if (result.error) {
				return {
					success: false,
					error: 'Numéro ou mot de passe incorrect',
				}
			}

			return { success: true }
		},
		[],
	)

	const logout = useCallback(() => {
		void authClient.signOut()
		navigate('/auth/login')
	}, [navigate])

	return (
		<AuthContext.Provider
			value={{
				user,
				isAuthenticated: !!user,
				isLoading: session.isPending,
				login,
				logout,
			}}
		>
			{children}
		</AuthContext.Provider>
	)
}

export function useAuth() {
	const context = useContext(AuthContext)
	if (context === undefined) {
		throw new Error('useAuth must be used within an AuthProvider')
	}
	return context
}
