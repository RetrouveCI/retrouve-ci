import {
	PAYMENT_ON_DELIVERY,
	STICKER_ORDER_SOURCES,
} from '@app/contracts/sticker-orders'
import { cleanup, page, render } from '@/shared/helpers/testing'
import { OrderDetailDialog } from '../order-detail-dialog'
import { ORDER_SOURCE_LABELS } from '../../orders.const'
import type { StickerOrder } from '../../types/orders.types'

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

function renderDialog(order: StickerOrder) {
	render(
		<OrderDetailDialog order={order} open onOpenChange={() => undefined} />,
	)
}

afterEach(cleanup)

// The figure says whether the product sells; this says where the sale came from.
describe('the source of an order', () => {
	it.each(STICKER_ORDER_SOURCES)(
		'names %s in the operator’s words',
		async source => {
			renderDialog(buildOrder({ source }))

			await expect
				.element(page.getByText(`Source : ${ORDER_SOURCE_LABELS[source]}`))
				.toBeVisible()
		},
	)

	it('shows it beside the payment method', async () => {
		renderDialog(buildOrder({ source: 'home' }))

		await expect
			.element(page.getByText('Mode de paiement : Paiement à la livraison'))
			.toBeVisible()
		await expect
			.element(page.getByText("Source : Bloc de l'accueil"))
			.toBeVisible()
	})
})
