import { createRoutesStub } from 'react-router'
import { cleanup, page, render } from '@/shared/helpers/testing'
import type { LostItemDocument } from '@/shared/types/lost-item'
import { PostContent } from '../post-content'

const LISTING = {
	title: 'CNI trouvée à Yopougon',
	description: '',
	location: 'Yopougon, Abidjan',
	date: 'il y a 2 jours',
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
