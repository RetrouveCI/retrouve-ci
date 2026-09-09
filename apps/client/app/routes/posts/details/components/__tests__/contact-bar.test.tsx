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
	id: string
	title: string
	type: 'lost' | 'found'
	contactReachable: boolean
}

const LISTING: BarListing = {
	id: 'lost-item-9',
	title: 'Téléphone Tecno Spark',
	type: 'lost',
	contactReachable: true,
}

function renderBar(listing: BarListing = LISTING) {
	const Stub = createRoutesStub([
		{ path: '/posts/:id', Component: () => <ContactBar listing={listing} /> },
	])
	render(<Stub initialEntries={['/posts/lost-item-9']} />)
}

const contact = () =>
	page.getByRole('button', { name: /Contacter par WhatsApp/ })

beforeEach(stopAnimations)
afterEach(cleanup)

describe('the contact bar', () => {
	// On the markup, not on a click: the number is no longer here to link from.
	it('posts to the route that records and redirects', async () => {
		renderBar()

		await expect.element(contact()).toBeVisible()
		const form = contact().element().closest('form')

		expect(form?.getAttribute('action')).toBe('/posts/lost-item-9/contact')
		expect(form?.getAttribute('method')).toBe('post')
	})

	// This used to pin `_blank`, so it held the defect in place.
	it('posts in this tab, so the browser follows the jump itself', async () => {
		renderBar()

		await expect.element(contact()).toBeVisible()
		const form = contact().element().closest('form')

		expect(form?.getAttribute('target')).toBeNull()
	})

	it('says so rather than offering the action, when it cannot be reached', async () => {
		renderBar({ ...LISTING, contactReachable: false })

		await expect
			.element(page.getByText('Numéro de contact indisponible'))
			.toBeVisible()
		expect(contact().query()).toBeNull()
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
