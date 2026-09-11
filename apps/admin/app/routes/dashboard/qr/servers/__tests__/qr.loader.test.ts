import { QR_TOKEN_STATUSES } from '@app/contracts/qr-codes'

const { requireAdminSession, listQrTokens } = vi.hoisted(() => ({
	requireAdminSession: vi.fn(),
	listQrTokens: vi.fn(),
}))

vi.mock('@/shared/helpers/session.server', () => ({ requireAdminSession }))
vi.mock('../qr.service', () => ({ listQrTokens }))

const { qrLoader } = await import('../qr.loader')

const requestFor = (search = '') =>
	new Request(`http://localhost:3001/qr${search}`)

const answer = (items: unknown[], total = items.length) => ({
	items,
	total,
	page: 1,
	pageSize: 25,
})

/** The page the loader asked for, told apart from its one-row count probes. */
const pageCall = () =>
	listQrTokens.mock.calls.find(([params]) => params.pageSize !== 1)?.[0]

beforeEach(() => {
	requireAdminSession.mockReset().mockResolvedValue(undefined)
	listQrTokens.mockReset().mockResolvedValue(answer([]))
})

afterEach(() => {
	vi.restoreAllMocks()
})

describe('qrLoader', () => {
	it('gates on the admin session before reading anything', async () => {
		const request = requestFor()

		await qrLoader({ request })

		expect(requireAdminSession).toHaveBeenCalledWith(request)
	})

	it('does not read the list when the session is refused', async () => {
		const redirect = new Response(null, { status: 302 })
		requireAdminSession.mockRejectedValue(redirect)

		await expect(qrLoader({ request: requestFor() })).rejects.toBe(redirect)
		expect(listQrTokens).not.toHaveBeenCalled()
	})

	// The list used to arrive whole and be paged in the browser, so what lay
	// past a hard-coded ceiling did not exist for the operator.
	it('asks the API for the first page by default', async () => {
		await qrLoader({ request: requestFor() })

		expect(pageCall()).toEqual({
			status: undefined,
			search: undefined,
			page: 1,
			pageSize: 25,
		})
	})

	it('forwards the page, the size and the search the URL carries', async () => {
		listQrTokens.mockResolvedValue(answer([], 500))

		await qrLoader({
			request: requestFor('?page=3&pageSize=50&q=%20RCI-7K%20'),
		})

		expect(pageCall()).toEqual({
			status: undefined,
			search: 'RCI-7K',
			page: 3,
			pageSize: 50,
		})
	})

	it.each(QR_TOKEN_STATUSES)('forwards the %s filter', async status => {
		const result = await qrLoader({
			request: requestFor(`?status=${status}`),
		})

		expect(pageCall()).toMatchObject({ status })
		expect(result.statusFilter).toBe(status)
	})

	it.each(['?status=perime', '?status=GENERATED', '?status='])(
		'drops the status the contract refuses in %s',
		async search => {
			const result = await qrLoader({ request: requestFor(search) })

			expect(pageCall()).toMatchObject({ status: undefined })
			expect(result.statusFilter).toBe('all')
		},
	)

	// Over every row, with the search applied: the chips and the grid add up to
	// the total, which they did not when they were counted on the page.
	it('counts each status through the API, with the search applied', async () => {
		listQrTokens.mockImplementation(async ({ status, pageSize }) =>
			answer([], pageSize === 1 && status ? 2 : 10),
		)

		const result = await qrLoader({ request: requestFor('?q=abc') })

		expect(result.counts).toEqual({
			all: 10,
			...Object.fromEntries(QR_TOKEN_STATUSES.map(status => [status, 2])),
		})
		for (const status of QR_TOKEN_STATUSES) {
			expect(listQrTokens).toHaveBeenCalledWith(
				{ status, search: 'abc', page: 1, pageSize: 1 },
				expect.any(Request),
			)
		}
	})

	it('reads the counters as absent when one cannot be served', async () => {
		listQrTokens.mockImplementation(async ({ status, pageSize }) => {
			if (pageSize === 1 && status === QR_TOKEN_STATUSES[0])
				throw new Error('down')
			return answer([], 3)
		})

		const result = await qrLoader({ request: requestFor() })

		expect(result.counts).toBeNull()
		expect(result.total).toBe(3)
	})

	it('sends a page past the end back to the last one', async () => {
		listQrTokens.mockResolvedValue(answer([], 30))

		const thrown = await qrLoader({
			request: requestFor(`?status=${QR_TOKEN_STATUSES[0]}&page=9`),
		}).catch((error: unknown) => error)

		expect((thrown as Response).headers.get('location')).toBe(
			`/qr?status=${QR_TOKEN_STATUSES[0]}&page=2`,
		)
	})

	it('returns the rows and the total the service reports', async () => {
		listQrTokens.mockResolvedValue(answer([{ id: 'row-1' }], 1))

		const result = await qrLoader({ request: requestFor() })

		expect(result.tokens).toEqual([{ id: 'row-1' }])
		expect(result.total).toBe(1)
	})
})
