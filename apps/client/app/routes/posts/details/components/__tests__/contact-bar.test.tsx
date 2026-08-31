import { createRoutesStub } from 'react-router'
import {
	cleanup,
	page,
	render,
	stopAnimations,
	userEvent,
} from '@/shared/helpers/testing'
import { ContactBar } from '../contact-bar'

interface BarListing {
	title: string
	type: 'lost' | 'found'
	contact: { whatsapp: string }
}

const LISTING: BarListing = {
	title: 'Téléphone Tecno Spark',
	type: 'lost',
	contact: { whatsapp: '+2250700000000' },
}

function renderBar(listing: BarListing = LISTING) {
	const Stub = createRoutesStub([
		{ path: '/posts/:id', Component: () => <ContactBar listing={listing} /> },
	])
	render(<Stub initialEntries={['/posts/1']} />)
}

const contact = () => page.getByRole('link', { name: /Contacter par WhatsApp/ })

beforeEach(stopAnimations)
afterEach(cleanup)

describe('the contact bar', () => {
	it('addresses the poster on WhatsApp, with the listing named', async () => {
		renderBar()

		await expect
			.element(contact())
			.toHaveAttribute(
				'href',
				`https://wa.me/2250700000000?text=${encodeURIComponent(
					"Bonjour, j'ai peut-être trouvé votre objet : « Téléphone Tecno Spark ». Je vous écris depuis RetrouveCI.",
				)}`,
			)
	})

	it('opens WhatsApp out of the tab, without handing it the referrer', async () => {
		renderBar()

		await expect.element(contact()).toHaveAttribute('target', '_blank')
		await expect
			.element(contact())
			.toHaveAttribute('rel', 'noopener noreferrer')
	})

	it('writes as the owner when the object was found', async () => {
		renderBar({ ...LISTING, type: 'found' })

		await expect.element(contact()).toBeVisible()
		const href = (await contact().element()).getAttribute('href') ?? ''

		expect(decodeURIComponent(href)).toContain('est peut-être le mien')
	})

	// The number CLAUDE.md records as stored double-prefixed in production.
	it('says so rather than linking, when the stored number is unusable', async () => {
		renderBar({ ...LISTING, contact: { whatsapp: '+2252250700000000' } })

		await expect
			.element(page.getByText('Numéro de contact indisponible'))
			.toBeVisible()
		expect(await contact().elements()).toHaveLength(0)
	})

	// A bare glyph would take « Partager » out of the accessibility tree with it.
	it('keeps the share action named, though it is drawn as an icon', async () => {
		renderBar()
		const share = page.getByRole('button', { name: 'Partager cette annonce' })

		await expect.element(share).toBeVisible()
		await userEvent.click(share)

		await expect
			.element(page.getByRole('menuitem', { name: 'WhatsApp' }))
			.toBeVisible()
		await expect
			.element(page.getByRole('menuitem', { name: 'Copier le lien' }))
			.toBeVisible()
	})
})
