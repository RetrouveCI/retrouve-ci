import { createRoutesStub } from 'react-router'
import {
	PAYMENT_ON_DELIVERY_LABEL,
	STICKER_PACKS,
} from '@app/contracts/sticker-orders'
import { cleanup, page, render, stopAnimations } from '@/shared/helpers/testing'
import { StickersSection } from '../stickers-section'

function renderSection() {
	const Stub = createRoutesStub([{ path: '/', Component: StickersSection }])
	render(<Stub initialEntries={['/']} />)
}

beforeEach(() => {
	stopAnimations()
})

afterEach(() => {
	cleanup()
})

describe('StickersSection', () => {
	it('prices the pack from the contract, never from the page', async () => {
		const cheapest = Math.min(...STICKER_PACKS.map(pack => pack.price))
		const price = new RegExp(
			`Dès ${new Intl.NumberFormat('fr-FR')
				.format(cheapest)
				.replace(/\s/gu, '\\s')} FCFA`,
		)

		renderSection()

		// One badge per layout — Tailwind is not loaded here, so both are visible.
		await expect.element(page.getByText(price).first()).toBeInTheDocument()
	})

	it('lifts the payment objection in the words the contract owns', async () => {
		renderSection()

		await expect
			.element(page.getByText(PAYMENT_ON_DELIVERY_LABEL))
			.toBeInTheDocument()
	})

	it('opens the order tunnel and the explainer, not one or the other', async () => {
		renderSection()

		await expect
			.element(page.getByRole('link', { name: /Commander/ }))
			.toHaveAttribute('href', '/stickers/order')
		await expect
			.element(page.getByRole('link', { name: 'Voir comment ça marche' }))
			.toHaveAttribute('href', '/stickers')
	})
})
