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
import type { User, Sticker, UserListing, ListingStatus } from '@/features/account/account.types'
import { accountService } from '@/features/account/servers/account.service'
import { stickersService } from '@/features/account/servers/stickers.service'
import { authClient } from './auth-client'
import { toE164 } from './phone'

export type { User, Sticker, UserListing }

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
	listings: UserListing[]
	activateSticker: (code: string, label: string, linkedObject?: string) => void
	deactivateSticker: (id: string) => void
	updateSticker: (id: string, updates: Partial<Sticker>) => void
	deleteListing: (id: string) => void
	updateListingStatus: (id: string, status: ListingStatus) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
	const navigate = useNavigate()
	const session = authClient.useSession()
	const [stickers, setStickers] = useState<Sticker[]>([])
	const [listings, setListings] = useState<UserListing[]>([])

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
			setListings([])
			return
		}
		void Promise.all([
			accountService.getUserListings(user.id),
			stickersService.getUserStickers(user.id),
		]).then(([userListings, userStickers]) => {
			setListings(userListings)
			setStickers(userStickers)
		})
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

	const deleteListing = useCallback(
		async (id: string) => {
			if (!user) return
			await accountService.deleteUserListing(user.id, id)
			setListings(prev => prev.filter(l => l.id !== id))
		},
		[user],
	)

	const updateListingStatus = useCallback(
		async (id: string, status: ListingStatus) => {
			if (!user) return
			await accountService.updateUserListingStatus(user.id, id, status)
			setListings(prev => prev.map(l => (l.id === id ? { ...l, status } : l)))
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
				listings,
				activateSticker,
				deactivateSticker,
				updateSticker,
				deleteListing,
				updateListingStatus,
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
