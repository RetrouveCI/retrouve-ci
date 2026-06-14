import { MOCK_LISTINGS } from '@/shared/mock/data'
import type { Listing, ListingDetail, ListingFilters } from '../listings.types'

const DETAIL_LISTINGS: ListingDetail[] = [
	{
		id: '1',
		title: 'iPhone 14 Pro noir',
		description:
			"Téléphone perdu dans un taxi à Cocody vers 18h. L'écran est légèrement fissuré au coin supérieur droit. Il y a une coque transparente avec des autocollants. Le téléphone était presque déchargé au moment de la perte. Récompense offerte pour toute information permettant de le retrouver.",
		location: 'Cocody, Abidjan',
		date: '2 avril 2026',
		type: 'lost',
		category: 'Téléphone',
		image: '/placeholder.svg?height=600&width=800',
		contact: { name: 'Kouamé A.', method: 'WhatsApp' },
	},
	{
		id: '2',
		title: 'Trousseau de clés avec porte-clés rouge',
		description:
			'Clés trouvées près de la pharmacie du marché de Treichville ce matin. Le trousseau contient 4 clés (2 grandes, 2 petites) avec un porte-clés en forme de cœur rouge. Il y a aussi une petite clé USB bleue attachée. Les clés semblent être pour un appartement ou une maison.',
		location: 'Treichville, Abidjan',
		date: '5 avril 2026',
		type: 'found',
		category: 'Clés',
		contact: { name: 'Marie K.', method: 'Application' },
	},
]

class ListingsService {
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

	async getById(id: string): Promise<ListingDetail | null> {
		return DETAIL_LISTINGS.find(l => l.id === id) ?? null
	}

	async create(data: Omit<Listing, 'id'>): Promise<Listing> {
		const newListing: Listing = { ...data, id: `listing-${Date.now()}` }
		this.listings.push(newListing)
		return newListing
	}
}

export const listingsService = new ListingsService()
