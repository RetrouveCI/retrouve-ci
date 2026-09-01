import { createRoutesStub } from 'react-router'
import { cleanup, page, render } from '@/shared/helpers/testing'
import { PAYMENT_ON_DELIVERY } from '@app/contracts/sticker-orders'
import { ActiveOrderCard } from '../active-order-card'
import type { Order } from '../../types/orders.types'

const ORDER: Order = {
	id: 'order-1',
	orderNumber: '2026-0184',
	date: '2026-08-25T10:00:00.000Z',
	pack: { id: 'pack-8', name: 'Famille', quantity: 8, price: 3500 },
	deliveryFee: 1000,
	total: 4500,
	status: 'shipped',
	paymentMethod: PAYMENT_ON_DELIVERY,
	deliveryAddress: 'Cocody Riviera 3, Abidjan',
}

function renderCard(order: Partial<Order> = {}) {
	const Stub = createRoutesStub([
		{
			path: '/account/orders',
			Component: () => <ActiveOrderCard order={{ ...ORDER, ...order }} />,
		},
		{ path: '/contact', Component: () => <p>Nous contacter</p> },
	])
	render(<Stub initialEntries={['/account/orders']} />)
}

afterEach(() => {
	cleanup()
	vi.restoreAllMocks()
})

describe('ActiveOrderCard', () => {
	it('leads with the pack and the order number', async () => {
		renderCard()

		await expect
			.element(page.getByText('Pack Famille · 8 stickers'))
			.toBeInTheDocument()
		await expect
			.element(page.getByText(/Commande n° 2026-0184 · 25 août 2026/))
			.toBeInTheDocument()
	})

	it('shows the amount owed, which is what one comes to check', async () => {
		renderCard()

		await expect.element(page.getByText('4 500 FCFA')).toBeInTheDocument()
		await expect
			.element(page.getByText('Paiement à la livraison'))
			.toBeInTheDocument()
	})

	it('names an older payment method as it was recorded', async () => {
		renderCard({ paymentMethod: 'Orange Money' })

		await expect.element(page.getByText('Orange Money')).toBeInTheDocument()
	})

	it('draws the four delivery steps', async () => {
		renderCard()

		for (const label of ['Reçue', 'Préparée', 'En route', 'Livrée']) {
			await expect.element(page.getByText(label).first()).toBeInTheDocument()
		}
	})

	it('shows the delivery note the order carries', async () => {
		renderCard({ deliveryNotes: 'Sonner au portail' })

		await expect
			.element(page.getByText('Sonner au portail'))
			.toBeInTheDocument()
	})

	it('draws no note line when the order has none', async () => {
		renderCard()

		await expect
			.element(page.getByText('Cocody Riviera 3, Abidjan'))
			.toBeInTheDocument()
		expect(page.getByText('Sonner au portail').elements()).toEqual([])
	})
})
