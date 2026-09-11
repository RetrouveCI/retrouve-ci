const { requireAdminSession, getOrder } = vi.hoisted(() => ({
	requireAdminSession: vi.fn(),
	getOrder: vi.fn(),
}))

vi.mock('@/shared/helpers/session.server', () => ({ requireAdminSession }))
vi.mock('../../../servers/orders.service', () => ({ getOrder }))

const { orderLoader } = await import('../order.loader')

const request = new Request('http://localhost:3001/orders/order-1')
const params = { id: 'order-1' }

beforeEach(() => {
	requireAdminSession.mockReset().mockResolvedValue(undefined)
	getOrder.mockReset().mockResolvedValue({ id: 'order-1' })
})

describe('orderLoader', () => {
	it('does not read the order when the session is refused', async () => {
		const redirect = new Response(null, { status: 302 })
		requireAdminSession.mockRejectedValue(redirect)

		await expect(orderLoader({ request, params })).rejects.toBe(redirect)
		expect(getOrder).not.toHaveBeenCalled()
	})

	it('reads the order in the path, forwarding the session', async () => {
		await expect(orderLoader({ request, params })).resolves.toEqual({
			order: { id: 'order-1' },
		})
		expect(getOrder).toHaveBeenCalledWith('order-1', request)
	})
})

// The mocks hoist above the import under test, so the file must be a module.
export {}
