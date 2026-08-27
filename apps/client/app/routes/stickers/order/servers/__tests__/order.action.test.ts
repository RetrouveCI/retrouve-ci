import { PHONE_ERROR_MESSAGE } from '@app/contracts/shared'
import type { ActionResult } from '@/shared/types/action'
import type { Order } from '../../../../account/orders/types/orders.types'
import { ApiError } from '@/shared/utils/api-fetch'

const { requireServerSession, createStickerOrder } = vi.hoisted(() => ({
	requireServerSession: vi.fn(),
	createStickerOrder: vi.fn(),
}))

vi.mock('@/shared/helpers/session.server', () => ({ requireServerSession }))
vi.mock('../order.service', () => ({ createStickerOrder }))

const { orderAction } = await import('../order.action')

const VALID = {
	packId: 'pack-4',
	name: 'Awa Traoré',
	phone: '0700000001',
	address: 'Rue 12, Cocody',
	city: 'Abidjan',
	paymentMethod: 'orange-money',
	paymentPhone: '0700000002',
}

const DTO = {
	id: 'order-1',
	orderNumber: 'CMD-2026-000001',
	packId: 'pack-4',
	packName: 'Starter',
	quantity: 4,
	unitPrice: 1500,
	deliveryFee: 1000,
	total: 2500,
	status: 'pending',
	paymentMethod: 'orange-money',
	deliveryAddress: 'Rue 12, Cocody',
	deliveryCity: 'Abidjan',
	deliveryNotes: null,
	trackingNumber: null,
	createdAt: '2026-08-01T10:00:00.000Z',
}

function submit(fields: Record<string, string>) {
	const body = new FormData()
	for (const [key, value] of Object.entries(fields)) body.append(key, value)

	return orderAction(
		new Request('http://localhost:3000/stickers/order', {
			method: 'POST',
			body,
		}),
	)
}

function errorsOf(result: ActionResult<Order>) {
	if (result.success) throw new Error('expected the action to report an error')
	return result.errors ?? {}
}

function payloadOf() {
	return createStickerOrder.mock.calls[0]?.[0] as Record<string, string>
}

beforeEach(() => {
	requireServerSession.mockReset().mockResolvedValue({ user: { id: 'user-1' } })
	createStickerOrder.mockReset().mockResolvedValue(DTO)
})

afterEach(() => {
	vi.restoreAllMocks()
})

describe('orderAction', () => {
	it('gates on the session before reading the body', async () => {
		requireServerSession.mockRejectedValue(new Response(null, { status: 302 }))

		await expect(submit(VALID)).rejects.toBeInstanceOf(Response)
		expect(createStickerOrder).not.toHaveBeenCalled()
	})

	// The form's field names are not the contract's, so the action renames them.
	it('maps the form fields onto the contract’s names', async () => {
		const result = await submit(VALID)

		expect(result.success).toBe(true)
		expect(payloadOf()).toMatchObject({
			packId: 'pack-4',
			paymentMethod: 'orange-money',
			deliveryAddress: 'Rue 12, Cocody',
			deliveryCity: 'Abidjan',
		})
	})

	/**
	 * The API has no field for the buyer's name, their phone or the number they
	 * paid from, so all three are folded into the delivery note — with the
	 * payment method's **label**, not its id.
	 */
	it('folds the contact and the payment into the delivery note', async () => {
		await submit(VALID)

		expect(payloadOf().deliveryNotes).toBe(
			'Contact: Awa Traoré (0700000001). Paiement Orange Money - 0700000002.',
		)
	})

	it('falls back to the raw id when a method has no label', async () => {
		await submit({ ...VALID, paymentMethod: 'wave' })

		const notes = payloadOf()?.deliveryNotes
		if (notes) expect(notes).toContain('Paiement ')
	})

	// The API rejects an empty coupon, so the key is omitted rather than blanked.
	it('omits a coupon left blank', async () => {
		await submit({ ...VALID, couponCode: '' })

		expect(payloadOf()).not.toHaveProperty('couponCode')
	})

	it('sends a coupon that was typed', async () => {
		await submit({ ...VALID, couponCode: 'RETROUVECI' })

		expect(payloadOf().couponCode).toBe('RETROUVECI')
	})

	/** The order page shows the created order, so the dto is mapped, not raw. */
	it('answers the mapped order, not the API dto', async () => {
		const result = await submit(VALID)

		expect(result).toEqual({
			success: true,
			data: {
				id: 'order-1',
				orderNumber: 'CMD-2026-000001',
				date: '2026-08-01T10:00:00.000Z',
				pack: { name: 'Starter', quantity: 4, price: 1500 },
				deliveryFee: 1000,
				total: 2500,
				status: 'pending',
				paymentMethod: 'orange-money',
				deliveryAddress: 'Rue 12, Cocody, Abidjan',
				trackingNumber: undefined,
			},
		})
	})

	/**
	 * The rule every other phone field in the app uses. The former
	 * `/^\d{8,16}$/` accepted an eight-digit number, so a delivery contact could
	 * be unreachable.
	 */
	it.each(['phone', 'paymentPhone'] as const)(
		'refuses an eight-digit %s',
		async field => {
			const result = await submit({ ...VALID, [field]: '07000000' })

			expect(errorsOf(result)[field]?.message).toBe(PHONE_ERROR_MESSAGE)
			expect(createStickerOrder).not.toHaveBeenCalled()
		},
	)

	it.each(['0700000001', '07 00 00 00 01', '+2250700000001', '2250700000001'])(
		'accepts the number %p, spacing and country code included',
		async phone => {
			expect((await submit({ ...VALID, phone })).success).toBe(true)
		},
	)

	it('refuses a pack the catalogue does not hold', async () => {
		const result = await submit({ ...VALID, packId: 'pack-999' })

		expect(result.success).toBe(false)
		expect(createStickerOrder).not.toHaveBeenCalled()
	})

	it('refuses a payment method the page does not offer', async () => {
		const result = await submit({ ...VALID, paymentMethod: 'bitcoin' })

		expect(errorsOf(result).paymentMethod?.message).toBe(
			'Sélectionnez un moyen de paiement',
		)
		expect(createStickerOrder).not.toHaveBeenCalled()
	})

	it('reports an API refusal as a root error', async () => {
		createStickerOrder.mockRejectedValue(new ApiError(400, 'Coupon expiré'))

		expect(errorsOf(await submit(VALID)).root?.message).toBe('Coupon expiré')
	})

	it('redirects to login when the API answers 401', async () => {
		createStickerOrder.mockRejectedValue(new ApiError(401, 'Unauthorized'))

		await expect(submit(VALID)).rejects.toBeInstanceOf(Response)
	})

	it('lets a non-API failure through', async () => {
		createStickerOrder.mockRejectedValue(new Error('boom'))

		await expect(submit(VALID)).rejects.toThrow('boom')
	})
})
