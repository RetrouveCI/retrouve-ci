'use client'

import {
	createContext,
	useContext,
	useState,
	useCallback,
	type ReactNode,
} from 'react'
import { useRouter } from 'next/navigation'
import type { User } from '@/domain/entities/user'
import type { Sticker } from '@/domain/entities/sticker'
import type { UserListing, ListingStatus } from '@/domain/entities/listing'
import { userRepository } from '@/infrastructure/repositories/mock-user-repository'
import { stickerRepository } from '@/infrastructure/repositories/mock-sticker-repository'

export type { User, Sticker, UserListing }

interface AuthContextType {
	user: User | null
	isAuthenticated: boolean
	isLoading: boolean
	login: (
		phone: string,
		password: string,
	) => Promise<{ success: boolean; error?: string }>
	register: (phone: string, password: string) => Promise<void>
	resetPassword: (phone: string, newPassword: string) => Promise<void>
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
	const router = useRouter()
	const [user, setUser] = useState<User | null>(null)
	const [isLoading, setIsLoading] = useState(false)
	const [stickers, setStickers] = useState<Sticker[]>([])
	const [listings, setListings] = useState<UserListing[]>([])

	const login = useCallback(
		async (
			phone: string,
			password: string,
		): Promise<{ success: boolean; error?: string }> => {
			setIsLoading(true)
			const result = await userRepository.login(phone, password)
			if (!result.success || !result.user) {
				setIsLoading(false)
				return { success: false, error: result.error }
			}
			const [userListings, userStickers] = await Promise.all([
				userRepository.getUserListings(result.user.id),
				stickerRepository.getUserStickers(result.user.id),
			])
			setUser(result.user)
			setListings(userListings)
			setStickers(userStickers)
			setIsLoading(false)
			return { success: true }
		},
		[],
	)

	const register = useCallback(async (phone: string, password: string) => {
		setIsLoading(true)
		const newUser = await userRepository.register(phone, password)
		const [userListings, userStickers] = await Promise.all([
			userRepository.getUserListings(newUser.id),
			stickerRepository.getUserStickers(newUser.id),
		])
		setUser(newUser)
		setListings(userListings)
		setStickers(userStickers)
		setIsLoading(false)
	}, [])

	const resetPassword = useCallback(
		async (phone: string, newPassword: string) => {
			setIsLoading(true)
			await userRepository.resetPassword(phone, newPassword)
			setIsLoading(false)
		},
		[],
	)

	const logout = useCallback(() => {
		setUser(null)
		setStickers([])
		setListings([])
		router.push('/auth')
	}, [router])

	const activateSticker = useCallback(
		async (code: string, label: string, linkedObject?: string) => {
			if (!user) return

			const newSticker = await stickerRepository.activate(
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
			await stickerRepository.deactivate(user.id, id)
			setStickers(prev =>
				prev.map(s => (s.id === id ? { ...s, isActive: false } : s)),
			)
		},
		[user],
	)

	const updateSticker = useCallback(
		async (id: string, updates: Partial<Sticker>) => {
			if (!user) return
			const updated = await stickerRepository.update(user.id, id, updates)
			setStickers(prev => prev.map(s => (s.id === id ? updated : s)))
		},
		[user],
	)

	const deleteListing = useCallback(
		async (id: string) => {
			if (!user) return
			await userRepository.deleteUserListing(user.id, id)
			setListings(prev => prev.filter(l => l.id !== id))
		},
		[user],
	)

	const updateListingStatus = useCallback(
		async (id: string, status: ListingStatus) => {
			if (!user) return
			await userRepository.updateUserListingStatus(user.id, id, status)
			setListings(prev => prev.map(l => (l.id === id ? { ...l, status } : l)))
		},
		[user],
	)

	return (
		<AuthContext.Provider
			value={{
				user,
				isAuthenticated: !!user,
				isLoading,
				login,
				register,
				resetPassword,
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
