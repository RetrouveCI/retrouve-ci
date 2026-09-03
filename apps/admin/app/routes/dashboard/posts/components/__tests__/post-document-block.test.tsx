import { page, render } from '@/shared/helpers/testing'
import { PostDocumentBlock } from '../post-document-block'
import type { Post } from '../../types/posts.types'

function buildPost(overrides: Partial<Post> = {}): Post {
	return {
		id: 'post-1',
		type: 'found',
		category: 'documents',
		title: 'CNI trouvée à Cocody',
		description: 'Trouvée devant la pharmacie',
		ville: 'Abidjan',
		commune: 'Cocody',
		eventDate: '2026-01-15T00:00:00.000Z',
		contactName: 'Jean Dupont',
		contactWhatsapp: '+2250700000000',
		photos: [],
		documentType: null,
		documentHolderName: null,
		documentNumber: null,
		documentIssuer: null,
		moderationStatus: 'pending',
		resolutionStatus: 'active',
		views: 0,
		contactsCount: 0,
		userId: 'user-1',
		createdAt: '2026-01-15T00:00:00.000Z',
		updatedAt: '2026-01-15T00:00:00.000Z',
		...overrides,
	}
}

describe('PostDocumentBlock', () => {
	// The block is optional on every listing, documents category included.
	it('renders nothing when the listing declares no piece of ID', () => {
		render(<PostDocumentBlock post={buildPost()} />)

		expect(page.getByText('Pièce déclarée').elements()).toHaveLength(0)
	})

	it('names the type from the contract and shows the holder', async () => {
		render(
			<PostDocumentBlock
				post={buildPost({
					documentType: 'driver_licence',
					documentHolderName: 'KOUASSI Jean',
				})}
			/>,
		)

		await expect
			.element(page.getByText('Permis de conduire'))
			.toBeInTheDocument()
		await expect.element(page.getByText('KOUASSI Jean')).toBeInTheDocument()
	})

	/** Moderation is the one audience served the number. */
	it('shows the number and says it reaches no public page', async () => {
		render(
			<PostDocumentBlock
				post={buildPost({
					documentType: 'insurance_card',
					documentHolderName: 'KOUASSI Jean',
					documentIssuer: 'NSIA',
					documentNumber: 'POL-2026-0042',
				})}
			/>,
		)

		await expect.element(page.getByText('POL-2026-0042')).toBeInTheDocument()
		await expect.element(page.getByText('NSIA')).toBeInTheDocument()
		await expect
			.element(page.getByText(/n'apparaît sur aucune page publique/))
			.toBeInTheDocument()
	})

	it('leaves out the lines the listing does not carry', async () => {
		render(
			<PostDocumentBlock
				post={buildPost({ documentHolderName: 'KOUASSI Jean' })}
			/>,
		)

		await expect.element(page.getByText('Titulaire')).toBeInTheDocument()
		expect(page.getByText('Numéro').elements()).toHaveLength(0)
		expect(page.getByText('Pièce', { exact: true }).elements()).toHaveLength(0)
	})
})
