import { createRoutesStub } from 'react-router'
import {
	PAYMENT_ON_DELIVERY,
	STICKER_ORDER_SOURCES,
} from '@app/contracts/sticker-orders'
import { page, render, userEvent } from '@/shared/helpers/testing'
import type { ActionResult } from '@/shared/types/action'
import { ORDER_SOURCE_LABELS } from '../../../orders.const'
import type { StickerOrder } from '../../../types/orders.types'
import { OrderStatusCard } from '../order-status-card'
import { OrderSummaryCard } from '../order-summary-card'

function buildOrder(overrides: Partial<StickerOrder> = {}): StickerOrder {
	return {
		id: 'order-1',
		orderNumber: 'CMD-2026-000001',
		packId: 'pack-4',
		packName: 'Starter',
		quantity: 4,
		unitPrice: 2000,
		deliveryFee: 1000,
		total: 3000,
		status: 'pending',
		paymentMethod: PAYMENT_ON_DELIVERY,
		source: 'direct',
		deliveryAddress: 'Cocody Riviera 3, Abidjan',
		deliveryCity: 'Abidjan',
		deliveryNotes: null,
		trackingNumber: null,
		userId: 'user-1',
		createdAt: '2026-01-15T00:00:00.000Z',
		updatedAt: '2026-01-15T00:00:00.000Z',
		shippedAt: null,
		deliveredAt: null,
		...overrides,
	}
}

// The figure says whether the product sells; this says where the sale came from.
describe('OrderSummaryCard', () => {
	it.each(STICKER_ORDER_SOURCES)(
		'names the %s source in the operator’s words',
		async source => {
			render(<OrderSummaryCard order={buildOrder({ source })} />)

			await expect
				.element(page.getByText(ORDER_SOURCE_LABELS[source]))
				.toBeVisible()
		},
	)

	it('says the stickers are paid to the courier', async () => {
		render(<OrderSummaryCard order={buildOrder()} />)

		await expect
			.element(page.getByText('Paiement à la livraison'))
			.toBeVisible()
	})
})

describe('OrderStatusCard', () => {
	function renderCard(
		order: StickerOrder,
		action: (args: { request: Request }) => Promise<ActionResult> = async () =>
			({ success: true }) as ActionResult,
	) {
		const Stub = createRoutesStub([
			{
				path: '/orders/:id',
				Component: () => <OrderStatusCard order={order} />,
				action,
			},
		])

		render(<Stub initialEntries={[`/orders/${order.id}`]} />)
	}

	it('offers the next step and sends it with the order’s id', async () => {
		const sent: Record<string, unknown>[] = []
		renderCard(buildOrder({ status: 'processing' }), async ({ request }) => {
			sent.push(Object.fromEntries(await request.formData()))
			return { success: true } as ActionResult
		})

		await userEvent.click(
			page.getByRole('button', { name: 'Marquer comme expédiée' }),
		)

		await vi.waitFor(() =>
			expect(sent).toEqual([{ id: 'order-1', status: 'shipped' }]),
		)
	})

	it('keeps a cancellation behind a confirmation', async () => {
		const action = vi.fn(async () => ({ success: true }) as ActionResult)
		renderCard(buildOrder({ status: 'pending' }), action)

		await userEvent.click(
			page.getByRole('button', { name: 'Annuler la commande' }),
		)

		await expect
			.element(page.getByText('Annuler cette commande ?'))
			.toBeVisible()
		expect(action).not.toHaveBeenCalled()
	})

	// Once it has left, a pack is on the courier's arm.
	it('offers nothing but the customer once the order is delivered', async () => {
		renderCard(buildOrder({ status: 'delivered' }))

		await expect.element(page.getByText(/plus rien à faire/)).toBeVisible()
		expect(
			page.getByRole('button', { name: 'Annuler la commande' }).elements(),
		).toHaveLength(0)
		await expect
			.element(page.getByRole('link', { name: 'Voir le client' }))
			.toHaveAttribute('href', '/users/user-1')
	})
})
