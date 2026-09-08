import { createRoutesStub } from 'react-router'
import { DOCUMENT_TYPES } from '@app/contracts/lost-items'
import { page, render } from '@/shared/helpers/testing'
import { DOCUMENT_TYPE_LABELS } from '@/shared/constants/documents'
import DocumentGuidePage, { meta } from '../_index'
import { DOCUMENT_GUIDE } from '../document-guide.const'

const PATH = '/carte-identite-perdue'

function renderGuide() {
	const Stub = createRoutesStub([{ path: PATH, Component: DocumentGuidePage }])
	render(<Stub initialEntries={[PATH]} />)
}

describe('the lost-document page', () => {
	it('names the piece the search names, in its heading', async () => {
		renderGuide()

		await expect
			.element(page.getByRole('heading', { level: 1 }))
			.toHaveTextContent(/carte d'identité/i)
	})

	// The declarative sentence is what a grounding model lifts, so it has to say
	// what the platform does rather than ask the visitor a question.
	it('states what the platform does with a piece', async () => {
		renderGuide()

		await expect
			.element(page.getByText(/sans en montrer aucune photo/))
			.toBeVisible()
	})

	it.each(DOCUMENT_TYPES)('gives the %s its own heading', async type => {
		renderGuide()

		await expect
			.element(
				page.getByRole('heading', {
					level: 3,
					name: DOCUMENT_TYPE_LABELS[type],
				}),
			)
			.toBeVisible()
	})

	it('leads the bank card with the move that comes first', async () => {
		renderGuide()

		await expect
			.element(page.getByText(DOCUMENT_GUIDE.bank_card.first ?? ''))
			.toBeVisible()
	})

	it.each([
		['/objet-perdu-cote-divoire', 'Les étapes de la déclaration'],
		['/publish/lost', 'Publier une annonce de perte'],
		['/posts', 'Voir les pièces déjà déclarées trouvées'],
		['/publish/found', 'Déclarer une pièce trouvée'],
	])('sends the visitor to %s', async (to, label) => {
		renderGuide()

		await expect
			.element(page.getByRole('link', { name: label }))
			.toHaveAttribute('href', to)
	})

	it('is indexable, and says what it is about', () => {
		const tags = meta() as { name?: string; content?: string }[]

		expect(tags.map(tag => tag.name)).not.toContain('robots')
		expect(tags.find(tag => tag.name === 'description')?.content).toMatch(
			/carte nationale d'identité/i,
		)
	})
})
