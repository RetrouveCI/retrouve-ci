import { createRoutesStub } from 'react-router'
import { cleanup, page, render, stopAnimations } from '@/shared/helpers/testing'
import { HeroSection } from '../hero-section'

function renderHero(publishedCount?: number) {
	const Stub = createRoutesStub([
		{
			path: '/',
			Component: () => <HeroSection publishedCount={publishedCount} />,
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

	/**
	 * Still the listings, by way of the assistant: `/search` sorts a sentence
	 * from a keyword and redirects to `/posts` either way. This is where someone
	 * who has just lost something arrives, so the sentence they would say out
	 * loud is the one that gets read — the header stays a plain `?q=`.
	 */
	it('sends the search to the assistant, which lands on the listings', async () => {
		renderHero()

		const form = page.getByRole('search')

		await expect.element(form).toHaveAttribute('action', '/search')
		await expect.element(form).toHaveAttribute('method', 'post')
	})

	it('announces the count the loader measured', async () => {
		renderHero(412)

		await expect
			.element(page.getByText('412 annonces en ligne'))
			.toBeInTheDocument()
	})

	it('stays silent rather than inventing a figure', async () => {
		renderHero()

		await expect
			.element(page.getByText(/annonces en ligne/))
			.not.toBeInTheDocument()
	})

	it('says nothing when the count is zero', async () => {
		renderHero(0)

		await expect
			.element(page.getByText(/annonces en ligne/))
			.not.toBeInTheDocument()
	})

	// An arrangement `typecheck` cannot see, so it is asserted here.
	it('groups the shortcuts with the field, ahead of the publish actions', async () => {
		renderHero()

		// `.element()` does not retry; the tree has to be settled first.
		await expect.element(page.getByRole('search')).toBeInTheDocument()

		const form = page.getByRole('search').element()
		const pill = page.getByRole('link', { name: 'Téléphones' }).element()
		const publish = page.getByRole('link', { name: "J'ai perdu" }).element()

		const follows = (from: Element, to: Element) =>
			Boolean(
				from.compareDocumentPosition(to) & Node.DOCUMENT_POSITION_FOLLOWING,
			)

		expect(follows(form, pill)).toBe(true)
		expect(follows(pill, publish)).toBe(true)

		const block = pill.parentElement?.parentElement
		expect(block?.contains(form)).toBe(true)
		expect(block?.contains(publish)).toBe(false)
	})

	it("shortcuts to a pre-filtered listing, in the categories' own words", async () => {
		renderHero()

		await expect
			.element(page.getByRole('link', { name: 'Téléphones' }))
			.toHaveAttribute('href', '/posts?category=phone')
		await expect
			.element(page.getByRole('link', { name: 'Documents' }))
			.toHaveAttribute('href', '/posts?category=documents')
	})
})
