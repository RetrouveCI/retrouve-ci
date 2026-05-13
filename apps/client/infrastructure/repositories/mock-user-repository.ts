import type {
	IUserRepository,
	LoginResult,
} from '@/domain/repositories/user-repository'
import type { User } from '@/domain/entities/user'
import type { UserListing, ListingStatus } from '@/domain/entities/listing'
import { MOCK_USER, MOCK_USER_LISTINGS } from '@/infrastructure/mock/data'

class MockUserRepository implements IUserRepository {
	private userListings: Map<string, UserListing[]> = new Map([
		[MOCK_USER.id, [...MOCK_USER_LISTINGS]],
	])

	async login(phone: string, password: string): Promise<LoginResult> {
		await new Promise(r => setTimeout(r, 800))
		if (password === '000000') {
			return { success: false, error: 'Mot de passe incorrect.' }
		}
		return { success: true, user: { ...MOCK_USER, phone } }
	}

	async register(phone: string, _password: string): Promise<User> {
		await new Promise(r => setTimeout(r, 800))
		const newUser: User = {
			...MOCK_USER,
			id: `user-${Date.now()}`,
			phone,
			name: 'Nouvel utilisateur',
			createdAt: new Date().toISOString().split('T')[0],
		}
		this.userListings.set(newUser.id, [])
		return newUser
	}

	async resetPassword(_phone: string, _newPassword: string): Promise<void> {
		await new Promise(r => setTimeout(r, 800))
	}

	async getUserListings(userId: string): Promise<UserListing[]> {
		return [...(this.userListings.get(userId) ?? [])]
	}

	async deleteUserListing(userId: string, listingId: string): Promise<void> {
		const current = this.userListings.get(userId) ?? []
		this.userListings.set(
			userId,
			current.filter(l => l.id !== listingId),
		)
	}

	async updateUserListingStatus(
		userId: string,
		listingId: string,
		status: ListingStatus,
	): Promise<void> {
		const current = this.userListings.get(userId) ?? []
		this.userListings.set(
			userId,
			current.map(l => (l.id === listingId ? { ...l, status } : l)),
		)
	}
}

export const userRepository: IUserRepository = new MockUserRepository()
