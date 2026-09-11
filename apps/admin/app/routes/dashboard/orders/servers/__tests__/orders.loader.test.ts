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

const answer = (items: unknown[], total = items.length) => ({
	items,
	total,
	page: 1,
	pageSize: 25,
})

/** The page the loader asked for, told apart from its one-row count probes. */
const pageCall = () =>
	listOrders.mock.calls.find(([params]) => params.pageSize !== 1)?.[0]

beforeEach(() => {
	requireAdminSession.mockReset().mockResolvedValue(undefined)
	listOrders.mockReset().mockResolvedValue(answer([]))
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

	// The list used to arrive whole and be paged in the browser, so what lay
	// past a hard-coded ceiling did not exist for the operator.
	it('asks the API for the first page by default', async () => {
		await ordersLoader({ request: requestFor() })

		expect(pageCall()).toEqual({
			status: undefined,
			search: undefined,
			page: 1,
			pageSize: 25,
		})
	})

	it('forwards the page, the size and the search the URL carries', async () => {
		listOrders.mockResolvedValue(answer([], 500))

		await ordersLoader({
			request: requestFor('?page=3&pageSize=50&q=%20Yopougon%20'),
		})

		expect(pageCall()).toEqual({
			status: undefined,
			search: 'Yopougon',
			page: 3,
			pageSize: 50,
		})
	})

	it.each(STICKER_ORDER_STATUSES)('forwards the %s filter', async status => {
		const result = await ordersLoader({
			request: requestFor(`?status=${status}`),
		})

		expect(pageCall()).toMatchObject({ status })
		expect(result.statusFilter).toBe(status)
	})

	it.each(['?status=rembourse', '?status=PENDING', '?status='])(
		'drops the status the contract refuses in %s',
		async search => {
			const result = await ordersLoader({ request: requestFor(search) })

			expect(pageCall()).toMatchObject({ status: undefined })
			expect(result.statusFilter).toBe('all')
		},
	)

	// Over every row, with the search applied: the chips and the grid add up to
	// the total, which they did not when they were counted on the page.
	it('counts each status through the API, with the search applied', async () => {
		listOrders.mockImplementation(async ({ status, pageSize }) =>
			answer([], pageSize === 1 && status ? 2 : 10),
		)

		const result = await ordersLoader({ request: requestFor('?q=abc') })

		expect(result.counts).toEqual({
			all: 10,
			...Object.fromEntries(STICKER_ORDER_STATUSES.map(status => [status, 2])),
		})
		for (const status of STICKER_ORDER_STATUSES) {
			expect(listOrders).toHaveBeenCalledWith(
				{ status, search: 'abc', page: 1, pageSize: 1 },
				expect.any(Request),
			)
		}
	})

	it('reads the counters as absent when one cannot be served', async () => {
		listOrders.mockImplementation(async ({ status, pageSize }) => {
			if (pageSize === 1 && status === STICKER_ORDER_STATUSES[0])
				throw new Error('down')
			return answer([], 3)
		})

		const result = await ordersLoader({ request: requestFor() })

		expect(result.counts).toBeNull()
		expect(result.total).toBe(3)
	})

	it('sends a page past the end back to the last one', async () => {
		listOrders.mockResolvedValue(answer([], 30))

		const thrown = await ordersLoader({
			request: requestFor(`?status=${STICKER_ORDER_STATUSES[0]}&page=9`),
		}).catch((error: unknown) => error)

		expect((thrown as Response).headers.get('location')).toBe(
			`/orders?status=${STICKER_ORDER_STATUSES[0]}&page=2`,
		)
	})

	it('returns the rows and the total the service reports', async () => {
		listOrders.mockResolvedValue(answer([{ id: 'row-1' }], 1))

		const result = await ordersLoader({ request: requestFor() })

		expect(result.orders).toEqual([{ id: 'row-1' }])
		expect(result.total).toBe(1)
	})
})
