import { CONTACT_MESSAGE_STATUSES } from '@app/contracts/contact-messages'

const { requireAdminSession, listContactMessages } = vi.hoisted(() => ({
	requireAdminSession: vi.fn(),
	listContactMessages: vi.fn(),
}))

vi.mock('@/shared/helpers/session.server', () => ({ requireAdminSession }))
vi.mock('../contact-messages.service', () => ({ listContactMessages }))

const { contactMessagesLoader } = await import('../contact-messages.loader')

const requestFor = (search = '') =>
	new Request(`http://localhost:3001/contact-messages${search}`)

const answer = (items: unknown[], total = items.length) => ({
	items,
	total,
	page: 1,
	pageSize: 25,
})

/** The page the loader asked for, told apart from its one-row count probes. */
const pageCall = () =>
	listContactMessages.mock.calls.find(([params]) => params.pageSize !== 1)?.[0]

beforeEach(() => {
	requireAdminSession.mockReset().mockResolvedValue(undefined)
	listContactMessages.mockReset().mockResolvedValue(answer([]))
})

afterEach(() => {
	vi.restoreAllMocks()
})

describe('contactMessagesLoader', () => {
	it('gates on the admin session before reading anything', async () => {
		const request = requestFor()

		await contactMessagesLoader({ request })

		expect(requireAdminSession).toHaveBeenCalledWith(request)
	})

	it('does not read the list when the session is refused', async () => {
		const redirect = new Response(null, { status: 302 })
		requireAdminSession.mockRejectedValue(redirect)

		await expect(contactMessagesLoader({ request: requestFor() })).rejects.toBe(
			redirect,
		)
		expect(listContactMessages).not.toHaveBeenCalled()
	})

	// The list used to arrive whole and be paged in the browser, so what lay
	// past a hard-coded ceiling did not exist for the operator.
	it('asks the API for the first page by default', async () => {
		await contactMessagesLoader({ request: requestFor() })

		expect(pageCall()).toEqual({
			status: undefined,
			search: undefined,
			page: 1,
			pageSize: 25,
		})
	})

	it('forwards the page, the size and the search the URL carries', async () => {
		listContactMessages.mockResolvedValue(answer([], 500))

		await contactMessagesLoader({
			request: requestFor('?page=3&pageSize=50&q=%20Konan%20'),
		})

		expect(pageCall()).toEqual({
			status: undefined,
			search: 'Konan',
			page: 3,
			pageSize: 50,
		})
	})

	it.each(CONTACT_MESSAGE_STATUSES)('forwards the %s filter', async status => {
		const result = await contactMessagesLoader({
			request: requestFor(`?status=${status}`),
		})

		expect(pageCall()).toMatchObject({ status })
		expect(result.statusFilter).toBe(status)
	})

	it.each(['?status=perime', '?status=NEW', '?status='])(
		'drops the status the contract refuses in %s',
		async search => {
			const result = await contactMessagesLoader({
				request: requestFor(search),
			})

			expect(pageCall()).toMatchObject({ status: undefined })
			expect(result.statusFilter).toBe('all')
		},
	)

	// Over every row, with the search applied: the chips and the grid add up to
	// the total, which they did not when they were counted on the page.
	it('counts each status through the API, with the search applied', async () => {
		listContactMessages.mockImplementation(async ({ status, pageSize }) =>
			answer([], pageSize === 1 && status ? 2 : 10),
		)

		const result = await contactMessagesLoader({
			request: requestFor('?q=abc'),
		})

		expect(result.counts).toEqual({
			all: 10,
			...Object.fromEntries(
				CONTACT_MESSAGE_STATUSES.map(status => [status, 2]),
			),
		})
		for (const status of CONTACT_MESSAGE_STATUSES) {
			expect(listContactMessages).toHaveBeenCalledWith(
				{ status, search: 'abc', page: 1, pageSize: 1 },
				expect.any(Request),
			)
		}
	})

	it('reads the counters as absent when one cannot be served', async () => {
		listContactMessages.mockImplementation(async ({ status, pageSize }) => {
			if (pageSize === 1 && status === CONTACT_MESSAGE_STATUSES[0])
				throw new Error('down')
			return answer([], 3)
		})

		const result = await contactMessagesLoader({ request: requestFor() })

		expect(result.counts).toBeNull()
		expect(result.total).toBe(3)
	})

	it('sends a page past the end back to the last one', async () => {
		listContactMessages.mockResolvedValue(answer([], 30))

		const thrown = await contactMessagesLoader({
			request: requestFor(`?status=${CONTACT_MESSAGE_STATUSES[0]}&page=9`),
		}).catch((error: unknown) => error)

		expect((thrown as Response).headers.get('location')).toBe(
			`/contact-messages?status=${CONTACT_MESSAGE_STATUSES[0]}&page=2`,
		)
	})

	it('returns the rows and the total the service reports', async () => {
		listContactMessages.mockResolvedValue(answer([{ id: 'row-1' }], 1))

		const result = await contactMessagesLoader({ request: requestFor() })

		expect(result.messages).toEqual([{ id: 'row-1' }])
		expect(result.total).toBe(1)
	})
})
