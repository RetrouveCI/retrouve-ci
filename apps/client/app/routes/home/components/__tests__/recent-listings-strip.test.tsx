import { createRoutesStub } from 'react-router'
import { cleanup, page, render, stopAnimations } from '@/shared/helpers/testing'
import type { LostItem } from '@/shared/types/lost-item'
import { RecentListingsStrip } from '../recent-listings-strip'
import type { HomeRecentListings } from '../../servers/home.loader'

function listing(overrides: Partial<LostItem> = {}): LostItem {
	return {
		id: 'a1',
		title: 'Téléphone Tecno noir',
		description: 'Perdu dans un gbaka.',
		location: 'Cocody, Abidjan',
		ville: 'Abidjan',
		commune: 'Cocody',
		date: 'hier',
		type: 'lost',
		category: 'phone',
		...overrides,
	}
}

function renderStrip(recent: HomeRecentListings | null) {
	const Stub = createRoutesStub([
		{ path: '/', Component: () => <RecentListingsStrip recent={recent} /> },
	])
	render(<Stub initialEntries={['/']} />)
}

beforeEach(() => {
	stopAnimations()
})

afterEach(() => {
	cleanup()
})

describe('RecentListingsStrip', () => {
	it('links each card to the listing it shows', async () => {
		renderStrip({ listings: [listing()], total: 412 })

		await expect
			.element(page.getByRole('link', { name: /Téléphone Tecno noir/ }))
			.toHaveAttribute('href', '/posts/a1')
	})

	it('names the type in the two words §2.3 rule 2 keeps apart', async () => {
		renderStrip({
			listings: [
				listing({ id: 'a1', type: 'lost' }),
				listing({ id: 'a2', type: 'found', title: 'Trousseau de clés' }),
			],
			total: 2,
		})

		await expect.element(page.getByText('Perdu')).toBeInTheDocument()
		await expect.element(page.getByText('Trouvé')).toBeInTheDocument()
	})

	it('carries the real total into the link when there is one', async () => {
		renderStrip({ listings: [listing()], total: 412 })

		await expect
			.element(page.getByRole('link', { name: 'Voir les 412 annonces' }))
			.toHaveAttribute('href', '/posts')
	})

	it('shows an empty state that invites the first listing', async () => {
		renderStrip({ listings: [], total: 0 })

		await expect
			.element(page.getByText(/Aucune annonce pour l/))
			.toBeInTheDocument()
		await expect
			.element(page.getByRole('link', { name: 'Publiez la première' }))
			.toHaveAttribute('href', '/publish/lost')
	})

	it('tells a failed load apart from an empty one', async () => {
		renderStrip(null)

		await expect
			.element(page.getByText(/pas pu être chargées/))
			.toBeInTheDocument()
		await expect
			.element(page.getByText(/Aucune annonce pour l/))
			.not.toBeInTheDocument()
	})

	it('falls back to the plain label when there is no count', async () => {
		renderStrip(null)

		await expect
			.element(page.getByRole('link', { name: 'Tout voir' }))
			.toBeInTheDocument()
	})
})
