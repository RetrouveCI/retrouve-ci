import type { StickerOrderApiDto } from '../../types/orders.types'

const { requireServerSession, getMyStickerOrders } = vi.hoisted(() => ({
	requireServerSession: vi.fn(),
	getMyStickerOrders: vi.fn(),
}))

vi.mock('@/shared/helpers/session.server', () => ({ requireServerSession }))
vi.mock('../orders.service', () => ({ getMyStickerOrders }))

const { ordersLoader } = await import('../orders.loader')

const DTO: StickerOrderApiDto = {
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
	deliveryAddress: 'Rue 12',
	deliveryCity: 'Abidjan',
	deliveryNotes: null,
	trackingNumber: null,
	createdAt: '2026-08-01T10:00:00.000Z',
}

function requestFor() {
	return new Request('http://localhost:3000/account/orders', {
		headers: { cookie: 'better-auth.session_token=abc' },
	})
}

beforeEach(() => {
	requireServerSession.mockReset().mockResolvedValue({ user: { id: 'user-1' } })
	getMyStickerOrders.mockReset().mockResolvedValue([DTO])
})

afterEach(() => {
	vi.restoreAllMocks()
})

describe('ordersLoader', () => {
	it('gates on the session before reading anything', async () => {
		const request = requestFor()

		await ordersLoader({ request })

		expect(requireServerSession).toHaveBeenCalledWith(request)
	})

	it('does not read the orders when the session is refused', async () => {
		const redirect = new Response(null, { status: 302 })
		requireServerSession.mockRejectedValue(redirect)

		await expect(ordersLoader({ request: requestFor() })).rejects.toBe(redirect)
		expect(getMyStickerOrders).not.toHaveBeenCalled()
	})

	// The API scopes `/sticker-orders/mine` to the cookie's owner, so the request
	// itself is what carries the identity.
	it('hands the request to the service', async () => {
		const request = requestFor()

		await ordersLoader({ request })

		expect(getMyStickerOrders).toHaveBeenCalledWith(request)
	})

	/** The mapper is the point: the page reads `pack` and a joined address. */
	it('maps each dto through the order mapper', async () => {
		const { orders } = await ordersLoader({ request: requestFor() })

		expect(orders).toEqual([
			{
				id: 'order-1',
				orderNumber: 'CMD-2026-000001',
				date: '2026-08-01T10:00:00.000Z',
				pack: { id: 'pack-4', name: 'Starter', quantity: 4, price: 1500 },
				deliveryFee: 1000,
				total: 2500,
				status: 'pending',
				paymentMethod: 'orange-money',
				deliveryAddress: 'Rue 12, Abidjan',
				deliveryNotes: undefined,
				trackingNumber: undefined,
			},
		])
	})

	it('keeps a tracking number when the order carries one', async () => {
		getMyStickerOrders.mockResolvedValue([{ ...DTO, trackingNumber: 'TRK-9' }])

		const { orders } = await ordersLoader({ request: requestFor() })

		expect(orders[0]?.trackingNumber).toBe('TRK-9')
	})

	// An account with no order is the common case, not an error.
	it('answers an empty list rather than nothing', async () => {
		getMyStickerOrders.mockResolvedValue([])

		expect(await ordersLoader({ request: requestFor() })).toEqual({
			orders: [],
		})
	})

	it('lets a service failure through to the error boundary', async () => {
		getMyStickerOrders.mockRejectedValue(new Error('api down'))

		await expect(ordersLoader({ request: requestFor() })).rejects.toThrow(
			'api down',
		)
	})
})
