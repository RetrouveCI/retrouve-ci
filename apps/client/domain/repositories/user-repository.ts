import type { UserListing, ListingStatus } from '@/domain/entities/listing'

export interface IUserRepository {
	getUserListings(userId: string): Promise<UserListing[]>
	deleteUserListing(userId: string, listingId: string): Promise<void>
	updateUserListingStatus(
		userId: string,
		listingId: string,
		status: ListingStatus,
	): Promise<void>
}
