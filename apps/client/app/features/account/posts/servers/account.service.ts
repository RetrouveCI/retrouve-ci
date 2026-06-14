import type { UserLostItem, LostItemStatus } from '@/shared/types/lost-item'
import { MOCK_USER, MOCK_USER_LISTINGS } from '@/shared/mock/data'

class MockAccountService {
	private userListings: Map<string, UserLostItem[]> = new Map([
		[MOCK_USER.id, [...MOCK_USER_LISTINGS]],
	])

	async getUserListings(userId: string): Promise<UserLostItem[]> {
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
		status: LostItemStatus,
	): Promise<void> {
		const current = this.userListings.get(userId) ?? []
		this.userListings.set(
			userId,
			current.map(l => (l.id === listingId ? { ...l, status } : l)),
		)
	}
}

export const accountService = new MockAccountService()
