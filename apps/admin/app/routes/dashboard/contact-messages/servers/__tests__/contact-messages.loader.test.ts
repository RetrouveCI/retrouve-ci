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

beforeEach(() => {
	requireAdminSession.mockReset().mockResolvedValue(undefined)
	listContactMessages.mockReset().mockResolvedValue({ items: [], total: 0 })
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

	it.each(CONTACT_MESSAGE_STATUSES)('forwards the %s filter', async status => {
		const result = await contactMessagesLoader({
			request: requestFor(`?status=${status}`),
		})

		expect(listContactMessages).toHaveBeenCalledWith(
			{ status },
			expect.any(Request),
		)
		expect(result.statusFilter).toBe(status)
	})

	it.each(['?status=perime', '?status=NEW', '?status='])(
		'drops the status the contract refuses in %s',
		async search => {
			await contactMessagesLoader({ request: requestFor(search) })

			expect(listContactMessages).toHaveBeenCalledWith(
				{ status: undefined },
				expect.any(Request),
			)
		},
	)

	it('reports no filter as all', async () => {
		const result = await contactMessagesLoader({ request: requestFor() })

		expect(result.statusFilter).toBe('all')
	})

	it('returns the messages and the total the service reports', async () => {
		listContactMessages.mockResolvedValue({
			items: [{ id: 'message-1' }],
			total: 1,
		})

		const result = await contactMessagesLoader({ request: requestFor() })

		expect(result.messages).toEqual([{ id: 'message-1' }])
		expect(result.total).toBe(1)
	})
})
