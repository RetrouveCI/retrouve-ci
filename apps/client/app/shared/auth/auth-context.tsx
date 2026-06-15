import {
	createContext,
	useContext,
	useCallback,
	useMemo,
	type ReactNode,
} from 'react'
import { useNavigate } from 'react-router'
import type { User } from '@/shared/types/user'
import { authClient } from './auth-client'
import { toE164 } from './phone'

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

	const sessionUser = session.data?.user
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
						createdAt: sessionUser.createdAt.toString(),
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
		navigate('/auth')
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
