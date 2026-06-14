export type {
	Listing,
	ListingType,
	ListingCategory,
	ListingStatus,
	UserListing,
} from '@/shared/types/listing'
import type { Listing, ListingType, ListingCategory } from '@/shared/types/listing'

export interface ListingFilters {
	type?: ListingType | 'all'
	category?: ListingCategory | string | 'all'
	ville?: string
	commune?: string
	search?: string
	dateFrom?: Date
	dateTo?: Date
}

export interface ListingDetail extends Listing {
	contact: { name: string; method: string }
}
