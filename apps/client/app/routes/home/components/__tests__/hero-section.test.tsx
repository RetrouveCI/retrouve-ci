import { createRoutesStub } from 'react-router'
import { cleanup, page, render, stopAnimations } from '@/shared/helpers/testing'
import { HeroSection } from '../hero-section'

function renderHero() {
	const Stub = createRoutesStub([{ path: '/', Component: HeroSection }])
	render(<Stub initialEntries={['/']} />)
}

beforeEach(() => {
	stopAnimations()
})

afterEach(() => {
	cleanup()
})

describe('HeroSection', () => {
	it('states the promise in one heading, with no word swapping under it', async () => {
		renderHero()

		const heading = page.getByRole('heading', { level: 1 })
		await expect.element(heading).toBeInTheDocument()
		await expect
			.element(heading)
			.toHaveTextContent(
				'Perdu quelque chose ?La communauté cherche avec vous.',
			)
	})

	it('offers both halves of the flow, in the words §2.3 rule 3 fixes', async () => {
		renderHero()

		await expect
			.element(page.getByRole('link', { name: "J'ai perdu" }))
			.toHaveAttribute('href', '/publish/lost')
		await expect
			.element(page.getByRole('link', { name: "J'ai trouvé" }))
			.toHaveAttribute('href', '/publish/found')
	})

	it('sends the search to the listings', async () => {
		renderHero()

		await expect
			.element(page.getByRole('search'))
			.toHaveAttribute('action', '/posts')
	})
})
