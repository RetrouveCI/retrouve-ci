import { createRoutesStub } from 'react-router'
import { cleanup, page, render } from '@/shared/helpers/testing'
import type { LostItemDocument } from '@/shared/types/lost-item'
import { PostContent } from '../post-content'

const LISTING = {
	title: 'CNI trouvée à Yopougon',
	description: '',
	location: 'Yopougon, Abidjan',
	postedAt: 'il y a 2 jours',
	eventDate: '1 août 2026',
	type: 'found' as const,
	category: 'documents',
	contact: { name: 'Awa' },
}

function renderContent(document?: LostItemDocument, description = '') {
	const Stub = createRoutesStub([
		{
			path: '/',
			Component: () => (
				<PostContent listing={{ ...LISTING, description, document }} />
			),
		},
	])
	render(<Stub initialEntries={['/']} />)
}

afterEach(cleanup)

describe('a listing that declares a piece', () => {
	it('names the piece and its holder', async () => {
		renderContent({
			type: 'insurance_card',
			holderName: 'KOUASSI Jean',
			issuer: 'NSIA',
		})

		await expect.element(page.getByText("Carte d'assurance")).toBeVisible()
		await expect.element(page.getByText('KOUASSI Jean')).toBeVisible()
		await expect.element(page.getByText('NSIA')).toBeVisible()
	})

	// The piece and its holder say what a paragraph used to, so a listing with
	// no description must not leave an empty heading behind.
	it('drops the description heading when there is none', async () => {
		renderContent({ type: 'national_id', holderName: 'KOUASSI Jean' })

		await expect
			.element(page.getByRole('heading', { name: 'Description' }))
			.not.toBeInTheDocument()
	})

	it('keeps the description when the listing wrote one', async () => {
		renderContent(undefined, 'Sac à dos noir, trouvé dans un gbaka.')

		await expect
			.element(page.getByRole('heading', { name: 'Description' }))
			.toBeVisible()
	})
})

// Two dates, so the labels have to say which is which.
describe('the two dates', () => {
	it('names the day the object was found and the day the listing went up', async () => {
		renderContent()

		await expect.element(page.getByText('Retrouvé le')).toBeVisible()
		await expect.element(page.getByText('1 août 2026')).toBeVisible()
		await expect.element(page.getByText('Date de publication')).toBeVisible()
		await expect.element(page.getByText('il y a 2 jours')).toBeVisible()
	})

	// The label follows the type axis, as the pill above it does (§2.3 rule 2).
	it('says « Perdu le » on a lost listing', async () => {
		const Stub = createRoutesStub([
			{
				path: '/',
				Component: () => (
					<PostContent listing={{ ...LISTING, type: 'lost' as const }} />
				),
			},
		])
		render(<Stub initialEntries={['/']} />)

		await expect.element(page.getByText('Perdu le')).toBeVisible()
		expect(page.getByText('Retrouvé le').elements()).toHaveLength(0)
	})
})
