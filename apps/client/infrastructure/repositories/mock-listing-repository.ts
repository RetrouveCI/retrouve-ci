import type {
	IListingRepository,
	ListingFilters,
} from '@/domain/repositories/listing-repository'
import type { Listing } from '@/domain/entities/listing'
import { MOCK_LISTINGS } from '@/infrastructure/mock/data'

class MockListingRepository implements IListingRepository {
	private listings: Listing[] = [...MOCK_LISTINGS]

	async getAll(filters?: ListingFilters): Promise<Listing[]> {
		let results = [...this.listings]

		if (!filters) return results

		const { type, category, ville, commune, search, dateFrom, dateTo } = filters

		if (type && type !== 'all') {
			results = results.filter(l => l.type === type)
		}
		if (category && category !== 'all') {
			results = results.filter(l => l.category === category)
		}
		if (ville && ville !== 'all') {
			results = results.filter(l =>
				l.location.toLowerCase().includes(ville.toLowerCase()),
			)
		}
		if (commune && commune !== 'all') {
			results = results.filter(l =>
				l.location.toLowerCase().includes(commune.toLowerCase()),
			)
		}
		if (search) {
			const q = search.toLowerCase()
			results = results.filter(
				l =>
					l.title.toLowerCase().includes(q) ||
					l.description.toLowerCase().includes(q) ||
					l.location.toLowerCase().includes(q),
			)
		}
		if (dateFrom && dateTo) {
			results = results.filter(l => {
				if (!l.dateISO) return true
				const d = new Date(l.dateISO)
				return d >= dateFrom && d <= dateTo
			})
		} else if (dateFrom) {
			results = results.filter(l => {
				if (!l.dateISO) return true
				return new Date(l.dateISO) >= dateFrom
			})
		}

		return results
	}

	async getById(id: string): Promise<Listing | null> {
		return this.listings.find(l => l.id === id) ?? null
	}

	async create(data: Omit<Listing, 'id'>): Promise<Listing> {
		const newListing: Listing = { ...data, id: `listing-${Date.now()}` }
		this.listings.push(newListing)
		return newListing
	}
}

export const listingRepository: IListingRepository = new MockListingRepository()
