import type { QrToken } from '../../../types/qr.types'

const { requireAdminSession, getQrTokenByCode } = vi.hoisted(() => ({
	requireAdminSession: vi.fn(),
	getQrTokenByCode: vi.fn(),
}))

vi.mock('@/shared/helpers/session.server', () => ({ requireAdminSession }))
vi.mock('../../../servers/qr.service', () => ({ getQrTokenByCode }))

const { qrTokenLoader } = await import('../qr-token.loader')

const TOKEN: QrToken = {
	id: 'qr-1',
	code: 'RCI-ABC123',
	status: 'activated',
	batch: null,
	label: 'Clés de voiture',
	linkedObject: null,
	userId: 'user-1',
	createdAt: '2026-08-01T10:00:00.000Z',
	activatedAt: '2026-08-02T10:00:00.000Z',
	revokedAt: null,
}

const requestFor = () =>
	new Request('http://localhost:3001/qr/RCI-ABC123', {
		headers: { cookie: 'retrouveci-admin.session_token=abc' },
	})

beforeEach(() => {
	requireAdminSession.mockReset().mockResolvedValue(undefined)
	getQrTokenByCode.mockReset().mockResolvedValue(TOKEN)
})

afterEach(() => {
	vi.restoreAllMocks()
})

describe('qrTokenLoader', () => {
	it('gates on the admin session before reading anything', async () => {
		const request = requestFor()

		await qrTokenLoader({ request, params: { code: 'RCI-ABC123' } })

		expect(requireAdminSession).toHaveBeenCalledWith(request)
	})

	it('does not read the token when the session is refused', async () => {
		const redirect = new Response(null, { status: 302 })
		requireAdminSession.mockRejectedValue(redirect)

		await expect(
			qrTokenLoader({ request: requestFor(), params: { code: 'RCI-ABC123' } }),
		).rejects.toBe(redirect)
		expect(getQrTokenByCode).not.toHaveBeenCalled()
	})

	// The endpoint is admin-only now, so an unforwarded cookie answers 401.
	it('forwards the request so the session reaches the API', async () => {
		const request = requestFor()

		await qrTokenLoader({ request, params: { code: 'RCI-ABC123' } })

		expect(getQrTokenByCode).toHaveBeenCalledWith('RCI-ABC123', request)
	})

	it('returns the token the service reports', async () => {
		const result = await qrTokenLoader({
			request: requestFor(),
			params: { code: 'RCI-ABC123' },
		})

		expect(result.token).toEqual(TOKEN)
	})
})
