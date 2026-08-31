import { createRoutesStub } from 'react-router'
import { cleanup, page, render } from '@/shared/helpers/testing'
import type { LostItem } from '@/shared/types/lost-item'
import { ListingCard } from '../listing-card'
import { PostGallery } from '../../details/components/post-gallery'

/**
 * R4's wiring guard. `imageUrl` is unit-tested on its own; what this checks is
 * that the photos actually reach the DOM through it, at the width each box was
 * measured at. Serving the Cloudinary original into an 80 px square is the
 * defect, and it is invisible to `typecheck` — the raw URL type-checks fine.
 */
const CLOUD = 'https://res.cloudinary.com/retrouveci/image/upload'
const PHOTO = `${CLOUD}/v1712345678/lost-items/abc123.jpg`
const served = (width: number) =>
	`${CLOUD}/f_auto,q_auto,c_limit,w_${width}/v1712345678/lost-items/abc123.jpg`

const LISTING: LostItem = {
	id: '1',
	title: 'Téléphone perdu',
	description: 'Un téléphone noir',
	location: 'Cocody',
	date: 'il y a 2 jours',
	type: 'lost',
	category: 'phone',
	image: PHOTO,
	images: [PHOTO],
}

function renderIn(ui: React.ReactNode) {
	const Stub = createRoutesStub([{ path: '/', Component: () => <>{ui}</> }])
	render(<Stub initialEntries={['/']} />)
}

const photo = () => page.getByAltText('Téléphone perdu')

afterEach(cleanup)

describe('listing photos are served at the size they are painted', () => {
	// Measured at 1920 px: the grid photo tops out at 489 CSS px, the list square
	// is fixed at 80. The request is twice the box, for a 2x screen.
	it.each([
		['grid', 1000],
		['list', 160],
	] as const)('the %s card asks for w_%i', async (variant, width) => {
		renderIn(<ListingCard listing={LISTING} variant={variant} />)

		await expect.element(photo()).toHaveAttribute('src', served(width))
	})

	it('defers a card photo, which may be far below the fold', async () => {
		renderIn(<ListingCard listing={LISTING} variant="grid" />)

		await expect.element(photo()).toHaveAttribute('loading', 'lazy')
	})

	// The detail photo is the page's LCP: deferring it is the one place lazy hurts.
	it('fetches the detail photo eagerly, at priority and at w_1600', async () => {
		renderIn(<PostGallery images={[PHOTO]} title="Téléphone perdu" isLost />)

		await expect.element(photo()).toHaveAttribute('src', served(1600))
		await expect.element(photo()).toHaveAttribute('fetchpriority', 'high')
		await expect.element(photo()).not.toHaveAttribute('loading', 'lazy')
	})

	it('defers the gallery thumbnails, which sit below it', async () => {
		renderIn(
			<PostGallery images={[PHOTO, PHOTO]} title="Téléphone perdu" isLost />,
		)
		const thumb = page.getByAltText('Téléphone perdu — photo 1')

		await expect.element(thumb).toHaveAttribute('src', served(128))
		await expect.element(thumb).toHaveAttribute('loading', 'lazy')
	})
})
