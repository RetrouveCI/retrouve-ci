import type { User } from '@/domain/entities/user'
import type { UserListing, ListingStatus } from '@/domain/entities/listing'

export interface LoginResult {
	success: boolean
	user?: User
	error?: string
}

export interface IUserRepository {
	login(phone: string, password: string): Promise<LoginResult>
	register(phone: string, password: string): Promise<User>
	resetPassword(phone: string, newPassword: string): Promise<void>
	getUserListings(userId: string): Promise<UserListing[]>
	deleteUserListing(userId: string, listingId: string): Promise<void>
	updateUserListingStatus(
		userId: string,
		listingId: string,
		status: ListingStatus,
	): Promise<void>
}
