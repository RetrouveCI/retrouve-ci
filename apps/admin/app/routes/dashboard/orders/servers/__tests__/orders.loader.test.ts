import { STICKER_ORDER_STATUSES } from '@app/contracts/sticker-orders'

const { requireAdminSession, listOrders } = vi.hoisted(() => ({
	requireAdminSession: vi.fn(),
	listOrders: vi.fn(),
}))

vi.mock('@/shared/helpers/session.server', () => ({ requireAdminSession }))
vi.mock('../orders.service', () => ({ listOrders }))

const { ordersLoader } = await import('../orders.loader')

const requestFor = (search = '') =>
	new Request(`http://localhost:3001/orders${search}`)

beforeEach(() => {
	requireAdminSession.mockReset().mockResolvedValue(undefined)
	listOrders.mockReset().mockResolvedValue({ items: [], total: 0 })
})

afterEach(() => {
	vi.restoreAllMocks()
})

describe('ordersLoader', () => {
	it('gates on the admin session before reading anything', async () => {
		const request = requestFor()

		await ordersLoader({ request })

		expect(requireAdminSession).toHaveBeenCalledWith(request)
	})

	it('does not read the list when the session is refused', async () => {
		const redirect = new Response(null, { status: 302 })
		requireAdminSession.mockRejectedValue(redirect)

		await expect(ordersLoader({ request: requestFor() })).rejects.toBe(redirect)
		expect(listOrders).not.toHaveBeenCalled()
	})

	// The five the contract knows, so the select and the API cannot disagree.
	it.each(STICKER_ORDER_STATUSES)('forwards the %s filter', async status => {
		const result = await ordersLoader({
			request: requestFor(`?status=${status}`),
		})

		expect(listOrders).toHaveBeenCalledWith({ status }, expect.any(Request))
		expect(result.statusFilter).toBe(status)
	})

	it.each(['?status=rembourse', '?status=PENDING', '?status='])(
		'drops the status the contract refuses in %s',
		async search => {
			await ordersLoader({ request: requestFor(search) })

			expect(listOrders).toHaveBeenCalledWith(
				{ status: undefined },
				expect.any(Request),
			)
		},
	)

	it('reports no filter as all', async () => {
		const result = await ordersLoader({ request: requestFor() })

		expect(result.statusFilter).toBe('all')
		expect(listOrders).toHaveBeenCalledWith(
			{ status: undefined },
			expect.any(Request),
		)
	})

	it('returns the items and the total the service reports', async () => {
		listOrders.mockResolvedValue({ items: [{ id: 'ord-1' }], total: 1 })

		const result = await ordersLoader({ request: requestFor() })

		expect(result.orders).toEqual([{ id: 'ord-1' }])
		expect(result.total).toBe(1)
	})
})
