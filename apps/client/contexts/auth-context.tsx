'use client'

import {
	createContext,
	useContext,
	useState,
	useCallback,
	type ReactNode,
} from 'react'
import { useRouter } from 'next/navigation'

// Mock user data type
export interface User {
	id: string
	phone: string
	name: string
	email?: string
	createdAt: string
}

// Mock sticker type
export interface Sticker {
	id: string
	code: string
	label: string
	isActive: boolean
	activatedAt?: string
	linkedObject?: string
}

// Mock listing type
export interface UserListing {
	id: string
	title: string
	description: string
	location: string
	date: string
	type: 'lost' | 'found'
	category: string
	image?: string
	status: 'active' | 'resolved' | 'expired'
	createdAt: string
	views: number
	contacts: number
}

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
	// User data
	stickers: Sticker[]
	listings: UserListing[]
	// Sticker actions
	activateSticker: (code: string, label: string, linkedObject?: string) => void
	deactivateSticker: (id: string) => void
	updateSticker: (id: string, updates: Partial<Sticker>) => void
	// Listing actions
	deleteListing: (id: string) => void
	updateListingStatus: (id: string, status: UserListing['status']) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock data for simulation
const MOCK_USER: User = {
	id: 'user-001',
	phone: '07 00 00 00 00',
	name: 'Kouame Jean',
	email: 'kouame.jean@email.com',
	createdAt: '2024-01-15',
}

const MOCK_STICKERS: Sticker[] = [
	{
		id: 'sticker-001',
		code: 'RCI-A1B2C3',
		label: 'Clés de maison',
		isActive: true,
		activatedAt: '2024-02-10',
		linkedObject: 'Trousseau de clés avec porte-clés rouge',
	},
	{
		id: 'sticker-002',
		code: 'RCI-D4E5F6',
		label: 'Portefeuille',
		isActive: true,
		activatedAt: '2024-03-05',
		linkedObject: 'Portefeuille cuir marron',
	},
	{
		id: 'sticker-003',
		code: 'RCI-G7H8I9',
		label: 'Sac à dos',
		isActive: false,
		activatedAt: undefined,
		linkedObject: undefined,
	},
]

const MOCK_LISTINGS: UserListing[] = [
	{
		id: 'listing-001',
		title: 'iPhone 14 Pro perdu',
		description:
			'iPhone 14 Pro couleur noir perdu dans un taxi à Cocody. Écran avec petite fissure en haut à gauche.',
		location: 'Cocody, Abidjan',
		date: '15 mars 2024',
		type: 'lost',
		category: 'Electronique',
		image: '/placeholder.svg?height=300&width=400',
		status: 'active',
		createdAt: '2024-03-15',
		views: 234,
		contacts: 5,
	},
	{
		id: 'listing-002',
		title: 'Carte bancaire retrouvée',
		description:
			'Carte VISA trouvée près de la station essence Total à Marcory.',
		location: 'Marcory, Abidjan',
		date: '20 mars 2024',
		type: 'found',
		category: 'Documents',
		status: 'resolved',
		createdAt: '2024-03-20',
		views: 156,
		contacts: 3,
	},
]

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
			await new Promise(resolve => setTimeout(resolve, 800))
			// Simulate: wrong password if it equals '000000'
			if (password === '000000') {
				setIsLoading(false)
				return { success: false, error: 'Mot de passe incorrect.' }
			}
			setUser({ ...MOCK_USER, phone })
			setStickers(MOCK_STICKERS)
			setListings(MOCK_LISTINGS)
			setIsLoading(false)
			return { success: true }
		},
		[],
	)

	const register = useCallback(async (phone: string, _password: string) => {
		setIsLoading(true)
		await new Promise(resolve => setTimeout(resolve, 800))
		setUser({
			...MOCK_USER,
			phone,
			name: 'Nouvel utilisateur',
			createdAt: new Date().toISOString().split('T')[0],
		})
		setStickers([MOCK_STICKERS[2]]) // Start with one inactive sticker
		setListings([])
		setIsLoading(false)
	}, [])

	const resetPassword = useCallback(
		async (_phone: string, _newPassword: string) => {
			setIsLoading(true)
			await new Promise(resolve => setTimeout(resolve, 800))
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

	// Sticker actions
	const activateSticker = useCallback(
		(code: string, label: string, linkedObject?: string) => {
			const newSticker: Sticker = {
				id: `sticker-${Date.now()}`,
				code,
				label,
				isActive: true,
				activatedAt: new Date().toISOString().split('T')[0],
				linkedObject,
			}
			setStickers(prev => [...prev, newSticker])
		},
		[],
	)

	const deactivateSticker = useCallback((id: string) => {
		setStickers(prev =>
			prev.map(s => (s.id === id ? { ...s, isActive: false } : s)),
		)
	}, [])

	const updateSticker = useCallback((id: string, updates: Partial<Sticker>) => {
		setStickers(prev => prev.map(s => (s.id === id ? { ...s, ...updates } : s)))
	}, [])

	// Listing actions
	const deleteListing = useCallback((id: string) => {
		setListings(prev => prev.filter(l => l.id !== id))
	}, [])

	const updateListingStatus = useCallback(
		(id: string, status: UserListing['status']) => {
			setListings(prev => prev.map(l => (l.id === id ? { ...l, status } : l)))
		},
		[],
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
