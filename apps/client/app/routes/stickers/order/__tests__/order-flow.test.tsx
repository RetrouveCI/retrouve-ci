import { createRoutesStub } from 'react-router'
import { PHONE_ERROR_MESSAGE } from '@app/contracts/shared'
import { PAYMENT_ON_DELIVERY } from '@app/contracts/sticker-orders'
import { page, render, userEvent } from '@/shared/helpers/testing'
import type { ActionResult } from '@/shared/types/action'
import CommanderPage from '../_index'
import type { Order } from '../../../account/orders/types/orders.types'

const { success, error } = vi.hoisted(() => ({
	success: vi.fn(),
	error: vi.fn(),
}))

// The `@app/ui/components` barrel pulls sonner's `Toaster` in, so the real
// module has to stay around — only `toast` is swapped.
vi.mock('sonner', async importOriginal => ({
	...(await importOriginal<typeof import('sonner')>()),
	toast: { success, error },
}))

const placedOrder: Order = {
	id: 'ord-1',
	orderNumber: 'RCI-0001',
	date: '2026-08-20T10:00:00.000Z',
	pack: { name: 'Famille', quantity: 8, price: 3500 },
	deliveryFee: 1000,
	total: 4500,
	status: 'pending',
	paymentMethod: PAYMENT_ON_DELIVERY,
	deliveryAddress: 'Cocody Riviera 2',
}

function renderPage(action: (args: { request: Request }) => unknown) {
	const Stub = createRoutesStub([
		{ path: '/stickers/order', Component: CommanderPage, action },
	])

	render(<Stub initialEntries={['/stickers/order']} />)
}

const pack = (name: string) =>
	page.getByRole('button', { name: new RegExp(name) })
const continueToDelivery = () =>
	page.getByRole('button', { name: 'Continuer', exact: true })
const confirmOrder = () =>
	page.getByRole('button', { name: 'Confirmer la commande' })

const name = () => page.getByLabelText(/^Nom complet/)
const phone = () => page.getByLabelText(/^Téléphone/)
const address = () => page.getByLabelText(/^Adresse de livraison/)
const coupon = () => page.getByLabelText(/Code promo/)

const ok = () => ({ success: true, data: placedOrder }) as ActionResult<Order>

async function reachDeliveryStep() {
	await userEvent.click(pack('Famille'))
	await userEvent.click(continueToDelivery())
}

async function fillDelivery() {
	await userEvent.fill(name(), 'Kouadio Jean')
	await userEvent.fill(phone(), '0700000000')
	await userEvent.fill(address(), 'Cocody Riviera 2, près de la pharmacie')
}

beforeEach(() => {
	success.mockReset()
	error.mockReset()
})

afterEach(() => {
	vi.restoreAllMocks()
})

describe('CommanderPage', () => {
	it('holds the first step shut until a pack is picked', async () => {
		renderPage(ok)

		await expect.element(continueToDelivery()).toBeDisabled()

		await userEvent.click(pack('Famille'))

		await expect.element(continueToDelivery()).toBeEnabled()
	})

	// Payment moved to the courier, so delivery is the last step a buyer fills.
	it('names the amount owed to the courier on the delivery step', async () => {
		renderPage(ok)

		await reachDeliveryStep()

		// `Intl` groups with a narrow no-break space, not a plain one.
		await expect
			.element(page.getByText(/4\s500\sFCFA en espèces au livreur/))
			.toBeInTheDocument()
	})

	it('reports the delivery fields on their own fields, without reaching the action', async () => {
		const action = vi.fn(ok)
		renderPage(action)

		await reachDeliveryStep()
		await userEvent.click(confirmOrder())

		await expect
			.element(page.getByText('Votre nom est requis'))
			.toBeInTheDocument()
		await expect
			.element(page.getByText(PHONE_ERROR_MESSAGE))
			.toBeInTheDocument()
		await expect
			.element(page.getByText('Adresse trop courte'))
			.toBeInTheDocument()
		// Still on the delivery step, and nothing was posted.
		await expect.element(confirmOrder()).toBeInTheDocument()
		expect(action).not.toHaveBeenCalled()
		// The step used to gate on a toast instead of the fields themselves.
		expect(error).not.toHaveBeenCalled()
	})

	it('posts the whole order once, and shows the confirmation it answers with', async () => {
		const received: Record<string, string> = {}
		renderPage(async ({ request }) => {
			for (const [key, value] of await request.formData()) {
				received[key] = String(value)
			}
			return ok()
		})

		await reachDeliveryStep()
		await fillDelivery()
		await userEvent.click(confirmOrder())

		await vi.waitFor(() => expect(received.packId).toBe('pack-8'))
		expect(received.name).toBe('Kouadio Jean')
		expect(received.address).toBe('Cocody Riviera 2, près de la pharmacie')
		expect(received.city).toBe('Abidjan')
		expect(received).not.toHaveProperty('paymentMethod')
		expect(received).not.toHaveProperty('paymentPhone')

		await expect.element(page.getByText('RCI-0001')).toBeInTheDocument()
		await expect
			.element(page.getByText('Paiement à la livraison'))
			.toBeInTheDocument()
	})

	it('renders a root error and stays on the delivery step', async () => {
		renderPage(
			() =>
				({
					success: false,
					errors: {
						root: { type: 'custom', message: 'Coupon expiré' },
					},
				}) as ActionResult<Order>,
		)

		await reachDeliveryStep()
		await fillDelivery()
		await userEvent.click(confirmOrder())

		await expect
			.element(page.getByText('Impossible de finaliser la commande'))
			.toBeInTheDocument()
		await expect.element(page.getByText('Coupon expiré')).toBeInTheDocument()
		await expect.element(confirmOrder()).toBeInTheDocument()
	})

	it('sends a valid coupon with the order and drops the delivery fee', async () => {
		const received: Record<string, string> = {}
		renderPage(async ({ request }) => {
			for (const [key, value] of await request.formData()) {
				received[key] = String(value)
			}
			return ok()
		})

		await reachDeliveryStep()
		await userEvent.fill(coupon(), 'retrouveci')
		await userEvent.click(page.getByRole('button', { name: 'Appliquer' }))

		await expect
			.element(page.getByText(/RETROUVECI — Livraison offerte/))
			.toBeInTheDocument()
		expect(success).toHaveBeenCalledWith('Coupon appliqué ! Livraison offerte.')

		await fillDelivery()
		await userEvent.click(confirmOrder())

		await vi.waitFor(() => expect(received.couponCode).toBe('RETROUVECI'))
	})

	it('rejects an unknown coupon without touching the order', async () => {
		renderPage(ok)

		await reachDeliveryStep()
		await userEvent.fill(coupon(), 'PASUNCODE')
		await userEvent.click(page.getByRole('button', { name: 'Appliquer' }))

		await expect
			.element(page.getByText('Code invalide ou expiré.'))
			.toBeInTheDocument()
		expect(success).not.toHaveBeenCalled()
	})
})
