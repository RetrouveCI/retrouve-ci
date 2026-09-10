import { createRoutesStub } from 'react-router'
import { cleanup, page, render } from '@/shared/helpers/testing'
import type { LostItem } from '@/shared/types/lost-item'
import { ListingCard } from '../listing-card'

const LISTING: LostItem = {
	id: '1',
	title: 'Carte nationale d’identité',
	description: 'Déposée au bureau',
	location: 'Cocody, Abidjan',
	postedAt: 'il y a 2 jours',
	eventDate: '6 sept. 2026',
	type: 'found',
	category: 'documents',
}

function renderCard(listing: LostItem, variant: 'grid' | 'list') {
	const Stub = createRoutesStub([
		{
			path: '/',
			Component: () => <ListingCard listing={listing} variant={variant} />,
		},
	])
	render(<Stub initialEntries={['/']} />)
}

afterEach(cleanup)

// Counted, never asserted absent: a locator over several matches resolves to no
// single element, so the negative form would pass on two badges as on zero.
const badges = () => page.getByText(/Équipe/).elements().length

// `.elements()` reads the DOM as it is right now, so each case waits for the card
// first. Without it the absent cases passed only because nothing was painted yet.
const cardPainted = () =>
	expect.element(page.getByText(LISTING.title)).toBeVisible()

describe('the team badge on a listing card', () => {
	it.each(['grid', 'list'] as const)(
		'shows once on a team listing (%s)',
		async variant => {
			renderCard({ ...LISTING, official: true }, variant)
			await cardPainted()

			expect(badges()).toBe(1)
		},
	)

	it.each(['grid', 'list'] as const)(
		'is absent from a visitor’s listing (%s)',
		async variant => {
			renderCard({ ...LISTING, official: false }, variant)
			await cardPainted()

			expect(badges()).toBe(0)
		},
	)
})
