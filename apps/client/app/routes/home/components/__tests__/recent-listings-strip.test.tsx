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
		postedAt: 'hier',
		eventDate: '1 août 2026',
		type: 'lost',
		category: 'phone',
		...overrides,
	}
}

// The count no longer rides on the listings: it comes from the counters
// endpoint, so the link and the hero badge cannot disagree.
function renderStrip(recent: HomeRecentListings | null, published?: number) {
	const Stub = createRoutesStub([
		{
			path: '/',
			Component: () => (
				<RecentListingsStrip recent={recent} published={published} />
			),
		},
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
		renderStrip({ listings: [listing()] }, 412)

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
		})

		await expect.element(page.getByText('Perdu')).toBeInTheDocument()
		await expect.element(page.getByText('Trouvé')).toBeInTheDocument()
	})

	it('carries the real total into the link when there is one', async () => {
		renderStrip({ listings: [listing()] }, 412)

		await expect
			.element(page.getByRole('link', { name: 'Voir les 412 annonces' }))
			.toHaveAttribute('href', '/posts')
	})

	it('groups the thousands in that link', async () => {
		renderStrip({ listings: [listing()] }, 1234)

		await expect
			.element(page.getByRole('link', { name: 'Voir les 1 234 annonces' }))
			.toBeInTheDocument()
	})

	it('falls back to « Tout voir » when no count came', async () => {
		renderStrip({ listings: [listing()] })

		await expect
			.element(page.getByRole('link', { name: 'Tout voir' }))
			.toHaveAttribute('href', '/posts')
	})

	it('shows an empty state that invites the first listing', async () => {
		renderStrip({ listings: [] }, 0)

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
