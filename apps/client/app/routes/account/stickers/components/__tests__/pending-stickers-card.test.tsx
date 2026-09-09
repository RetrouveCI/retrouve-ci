import { createRoutesStub } from 'react-router'
import { cleanup, page, render } from '@/shared/helpers/testing'
import { PendingStickersCard } from '../pending-stickers-card'

function renderCard(pending: number) {
	const Stub = createRoutesStub([
		{ path: '/', Component: () => <PendingStickersCard pending={pending} /> },
	])
	render(<Stub initialEntries={['/']} />)
}

afterEach(cleanup)

/**
 * The artboard draws one card per waiting sticker; the database cannot, since a
 * sticker becomes somebody's row only when it is activated. One card carries
 * the batch, and it is the only place the list says work is left.
 */
describe('PendingStickersCard', () => {
	it('counts the batch and leads to the scanner', async () => {
		renderCard(9)

		await expect.element(page.getByText('9 stickers en attente')).toBeVisible()
		await expect
			.element(page.getByRole('link'))
			.toHaveAttribute('href', '/scan')
	})

	it('reads in the singular at one', async () => {
		renderCard(1)

		await expect.element(page.getByText('1 sticker en attente')).toBeVisible()
		await expect
			.element(page.getByText('Scannez-le pour le nommer'))
			.toBeVisible()
	})

	it('reads in the plural above one', async () => {
		renderCard(4)

		await expect
			.element(page.getByText('Scannez-les pour les nommer'))
			.toBeVisible()
	})
})
