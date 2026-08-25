import { STICKER_ORDER_STATUSES } from '@app/contracts/sticker-orders'

const { requireAdminSession, updateOrderStatus } = vi.hoisted(() => ({
	requireAdminSession: vi.fn(),
	updateOrderStatus: vi.fn(),
}))

vi.mock('@/shared/helpers/session.server', () => ({ requireAdminSession }))
vi.mock('../orders.service', () => ({ updateOrderStatus }))

const { ordersAction } = await import('../orders.action')

/** The action answers `{ ok, error }`, wrapped in `data()` on a failure. */
const payloadOf = async (result: unknown) => {
	const value = result as { data?: unknown }
	return (value.data ?? result) as { ok: boolean; error?: string }
}

function requestFor(fields: Record<string, string>) {
	const body = new FormData()
	for (const [key, value] of Object.entries(fields)) body.append(key, value)
	return new Request('http://localhost:3001/orders', { method: 'POST', body })
}

beforeEach(() => {
	requireAdminSession.mockReset().mockResolvedValue(undefined)
	updateOrderStatus.mockReset().mockResolvedValue({ id: 'order-1' })
})

afterEach(() => {
	vi.restoreAllMocks()
})

describe('ordersAction', () => {
	it('gates on the admin session before writing anything', async () => {
		const request = requestFor({ id: 'order-1', status: 'shipped' })

		await ordersAction({ request })

		expect(requireAdminSession).toHaveBeenCalledWith(request)
	})

	it.each(STICKER_ORDER_STATUSES)('accepts the %s status', async status => {
		const result = await ordersAction({
			request: requestFor({ id: 'order-1', status }),
		})

		expect(updateOrderStatus).toHaveBeenCalledWith(
			'order-1',
			status,
			expect.any(Request),
		)
		expect(result).toMatchObject({ ok: true })
	})

	it.each([
		{ id: 'order-1', status: 'perime' },
		{ id: 'order-1', status: 'SHIPPED' },
		{ id: 'order-1', status: '' },
		{ id: '', status: 'shipped' },
		{},
	] as Record<string, string>[])(
		'refuses %o without touching the order',
		async fields => {
			const result = await ordersAction({ request: requestFor(fields) })

			expect(await payloadOf(result)).toEqual({
				ok: false,
				error: 'Paramètres invalides',
			})
			expect(updateOrderStatus).not.toHaveBeenCalled()
		},
	)
})
