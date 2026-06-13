'use client'

import { createContext, useContext, type ReactNode } from 'react'
import type { AdminUser } from '@/domain/entities/admin'
import { authClient } from '@/infrastructure/auth/auth-client'

interface AuthContextType {
	user: AdminUser | null
	isLoading: boolean
	login: (
		email: string,
		password: string,
	) => Promise<{ success: boolean; error?: string }>
	logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
	const session = authClient.useSession()

	const sessionUser = session.data?.user
	const user: AdminUser | null =
		sessionUser && sessionUser.role === 'admin'
			? { email: sessionUser.email, name: sessionUser.name, role: sessionUser.role }
			: null

	const login = async (
		email: string,
		password: string,
	): Promise<{ success: boolean; error?: string }> => {
		const result = await authClient.signIn.email({ email, password })

		if (result.error) {
			return { success: false, error: 'Email ou mot de passe incorrect' }
		}

		if (result.data.user.role !== 'admin') {
			await authClient.signOut()
			return {
				success: false,
				error: "Ce compte n'a pas les droits administrateur",
			}
		}

		return { success: true }
	}

	const logout = () => {
		void authClient.signOut()
	}

	return (
		<AuthContext.Provider
			value={{ user, isLoading: session.isPending, login, logout }}
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
