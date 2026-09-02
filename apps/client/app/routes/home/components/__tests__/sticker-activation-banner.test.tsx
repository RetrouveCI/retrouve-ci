import { createRoutesStub } from 'react-router'
import { cleanup, page, render } from '@/shared/helpers/testing'
import { StickerActivationBanner } from '../sticker-activation-banner'

function renderBanner(pending: number) {
	const Stub = createRoutesStub([
		{
			path: '/',
			Component: () => <StickerActivationBanner pending={pending} />,
		},
	])
	render(<Stub initialEntries={['/']} />)
}

afterEach(cleanup)

/**
 * The banner is conditional by construction — the page renders it only while
 * `pending > 0` — so what is asserted here is the wording and the destination.
 */
describe('StickerActivationBanner', () => {
	it('announces the pack that arrived and opens the scanner', async () => {
		renderBanner(12)

		await expect
			.element(page.getByText('Vos 12 stickers sont arrivés'))
			.toBeVisible()
		await expect
			.element(page.getByRole('link', { name: /Commencer à scanner/ }))
			.toHaveAttribute('href', '/scan')
	})

	it('does not say « Vos 1 stickers » on the last one', async () => {
		renderBanner(1)

		await expect
			.element(page.getByText('Un sticker attend son objet'))
			.toBeVisible()
	})
})
