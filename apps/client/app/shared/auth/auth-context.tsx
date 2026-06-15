import {
	createContext,
	useContext,
	useState,
	useCallback,
	useEffect,
	useMemo,
	type ReactNode,
} from 'react'
import { useNavigate } from 'react-router'
import type { User } from '@/shared/types/user'
import type { Sticker } from '@/shared/types/sticker'
import { stickersService } from '@/features/account/stickers/servers/stickers.service'
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
	stickers: Sticker[]
	activateSticker: (code: string, label: string, linkedObject?: string) => void
	deactivateSticker: (id: string) => void
	updateSticker: (id: string, updates: Partial<Sticker>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
	const navigate = useNavigate()
	const session = authClient.useSession()
	const [stickers, setStickers] = useState<Sticker[]>([])

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

	useEffect(() => {
		if (!user) {
			setStickers([])
			return
		}
		void stickersService.getUserStickers(user.id).then(setStickers)
	}, [user])

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

	const activateSticker = useCallback(
		async (code: string, label: string, linkedObject?: string) => {
			if (!user) return

			const newSticker = await stickersService.activate(
				user.id,
				code,
				label,
				linkedObject,
			)
			setStickers(prev => [...prev, newSticker])
		},
		[user],
	)

	const deactivateSticker = useCallback(
		async (id: string) => {
			if (!user) return
			await stickersService.deactivate(user.id, id)
			setStickers(prev =>
				prev.map(s => (s.id === id ? { ...s, isActive: false } : s)),
			)
		},
		[user],
	)

	const updateSticker = useCallback(
		async (id: string, updates: Partial<Sticker>) => {
			if (!user) return
			const updated = await stickersService.update(user.id, id, updates)
			setStickers(prev => prev.map(s => (s.id === id ? updated : s)))
		},
		[user],
	)

	return (
		<AuthContext.Provider
			value={{
				user,
				isAuthenticated: !!user,
				isLoading: session.isPending,
				login,
				logout,
				stickers,
				activateSticker,
				deactivateSticker,
				updateSticker,
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
