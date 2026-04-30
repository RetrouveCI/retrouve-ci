'use client'

import {
	createContext,
	useContext,
	useState,
	useEffect,
	type ReactNode,
} from 'react'
import type { AdminUser } from '@/domain/entities/admin'
import { MOCK_ADMIN_USER } from '@/infrastructure/mock/data'

interface AuthContextType {
	user: AdminUser | null
	isLoading: boolean
	login: (email: string, password: string) => Promise<boolean>
	logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<AdminUser | null>(null)
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		const stored = localStorage.getItem('retrouveci_admin')
		if (stored) {
			try {
				setUser(JSON.parse(stored))
			} catch {
				localStorage.removeItem('retrouveci_admin')
			}
		}
		setIsLoading(false)
	}, [])

	const login = async (email: string, password: string): Promise<boolean> => {
		if (email === MOCK_ADMIN_USER.email && password === 'admin123') {
			setUser(MOCK_ADMIN_USER)
			localStorage.setItem('retrouveci_admin', JSON.stringify(MOCK_ADMIN_USER))
			return true
		}
		return false
	}

	const logout = () => {
		setUser(null)
		localStorage.removeItem('retrouveci_admin')
	}

	return (
		<AuthContext.Provider value={{ user, isLoading, login, logout }}>
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
