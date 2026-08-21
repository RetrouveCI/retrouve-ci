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

beforeEach(() => {
	requireAdminSession.mockReset().mockResolvedValue(undefined)
	listQrTokens.mockReset().mockResolvedValue({ items: [], total: 0 })
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

	it.each(QR_TOKEN_STATUSES)('forwards the %s filter', async status => {
		const result = await qrLoader({ request: requestFor(`?status=${status}`) })

		expect(listQrTokens).toHaveBeenCalledWith({ status }, expect.any(Request))
		expect(result.statusFilter).toBe(status)
	})

	it.each(['?status=perime', '?status=GENERATED', '?status='])(
		'drops the status the contract refuses in %s',
		async search => {
			await qrLoader({ request: requestFor(search) })

			expect(listQrTokens).toHaveBeenCalledWith(
				{ status: undefined },
				expect.any(Request),
			)
		},
	)

	it('reports no filter as all', async () => {
		const result = await qrLoader({ request: requestFor() })

		expect(result.statusFilter).toBe('all')
		expect(listQrTokens).toHaveBeenCalledWith(
			{ status: undefined },
			expect.any(Request),
		)
	})

	it('returns the tokens and the total the service reports', async () => {
		listQrTokens.mockResolvedValue({
			items: [{ code: 'RCI-ABC123' }],
			total: 1,
		})

		const result = await qrLoader({ request: requestFor() })

		expect(result.tokens).toEqual([{ code: 'RCI-ABC123' }])
		expect(result.total).toBe(1)
	})
})
