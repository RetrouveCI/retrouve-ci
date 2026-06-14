import type { UserListing, ListingStatus } from '../account.types'
import { MOCK_USER, MOCK_USER_LISTINGS } from '@/shared/mock/data'

class MockAccountService {
	private userListings: Map<string, UserListing[]> = new Map([
		[MOCK_USER.id, [...MOCK_USER_LISTINGS]],
	])

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

export const accountService = new MockAccountService()
