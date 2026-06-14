export type ListingType = 'lost' | 'found'
export type ListingStatus = 'active' | 'resolved' | 'expired'
export type ListingCategory =
	| 'phones'
	| 'keys'
	| 'wallets'
	| 'bags'
	| 'electronics'
	| 'other'

export interface Listing {
	id: string
	title: string
	description: string
	location: string
	ville?: string
	commune?: string
	date: string
	dateISO?: string
	type: ListingType
	category: ListingCategory | string
	image?: string
}

export interface UserListing extends Listing {
	status: ListingStatus
	createdAt: string
	views: number
	contacts: number
}

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
