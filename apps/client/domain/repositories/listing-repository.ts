import type { Listing } from '@/domain/entities/listing'
import type { ListingType, ListingCategory } from '@/domain/entities/listing'

export interface ListingFilters {
	type?: ListingType | 'all'
	category?: ListingCategory | string | 'all'
	ville?: string
	commune?: string
	search?: string
	dateFrom?: Date
	dateTo?: Date
}

export interface IListingRepository {
	getAll(filters?: ListingFilters): Promise<Listing[]>
	getById(id: string): Promise<Listing | null>
	create(data: Omit<Listing, 'id'>): Promise<Listing>
}
