import { ApiError } from '@/shared/utils/api-fetch'

const { requireAdminSession, revokeQrToken } = vi.hoisted(() => ({
	requireAdminSession: vi.fn(),
	revokeQrToken: vi.fn(),
}))

vi.mock('@/shared/helpers/session.server', () => ({ requireAdminSession }))
vi.mock('../../../servers/qr.service', () => ({ revokeQrToken }))

const { qrTokenAction } = await import('../qr-token.action')

function submit(fields: Record<string, string>, code = 'RCI-ABC123') {
	const body = new FormData()
	for (const [key, value] of Object.entries(fields)) body.append(key, value)

	return qrTokenAction({
		request: new Request(`http://localhost:3001/qr/${code}`, {
			method: 'POST',
			body,
		}),
		params: { code },
	})
}

/** The action answers `data(...)` on refusal, a plain object on success. */
function bodyOf(result: unknown) {
	const asData = result as { data?: unknown; init?: { status?: number } }
	return {
		body: (asData.data ?? result) as { ok: boolean; error?: string },
		status: asData.init?.status,
	}
}

beforeEach(() => {
	requireAdminSession.mockReset().mockResolvedValue(undefined)
	revokeQrToken
		.mockReset()
		.mockResolvedValue({ code: 'RCI-ABC123', status: 'revoked' })
})

afterEach(() => {
	vi.restoreAllMocks()
})

describe('qrTokenAction', () => {
	it('gates on the admin session before doing anything', async () => {
		requireAdminSession.mockRejectedValue(new Response(null, { status: 302 }))

		await expect(submit({ intent: 'revoke' })).rejects.toBeInstanceOf(Response)
		expect(revokeQrToken).not.toHaveBeenCalled()
	})

	it('revokes the token named by the route param', async () => {
		const { body } = bodyOf(await submit({ intent: 'revoke' }, 'RCI-XYZ789'))

		expect(body).toEqual({
			ok: true,
			token: { code: 'RCI-ABC123', status: 'revoked' },
		})
		expect(revokeQrToken).toHaveBeenCalledWith(
			'RCI-XYZ789',
			expect.any(Request),
		)
	})

	it.each(['activate', '', 'delete'])(
		'answers 400 for intent %p, revoking nothing',
		async intent => {
			const { body, status } = bodyOf(await submit({ intent }))

			expect(status).toBe(400)
			expect(body).toEqual({ ok: false, error: 'Intent inconnu' })
			expect(revokeQrToken).not.toHaveBeenCalled()
		},
	)

	/**
	 * The API refuses a token that is not the caller's, and its own message names
	 * the code. The visitor gets a sentence about what they may do instead.
	 */
	it('rewrites a 403 into an explanation, keeping the status', async () => {
		revokeQrToken.mockRejectedValue(new ApiError(403, 'Forbidden'))

		const { body, status } = bodyOf(await submit({ intent: 'revoke' }))

		expect(status).toBe(403)
		expect(body).toEqual({
			ok: false,
			error: 'Vous ne pouvez pas révoquer ce token.',
		})
	})

	it.each([404, 400, 401])(
		'passes the API message through on a %i',
		async statusCode => {
			revokeQrToken.mockRejectedValue(new ApiError(statusCode, 'Token inconnu'))

			const { body, status } = bodyOf(await submit({ intent: 'revoke' }))

			expect(status).toBe(statusCode)
			expect(body).toEqual({ ok: false, error: 'Token inconnu' })
		},
	)

	// A non-API failure must not leak a stack trace or an internal message.
	it('answers a generic 500 for anything that is not an ApiError', async () => {
		revokeQrToken.mockRejectedValue(new Error('ECONNREFUSED 127.0.0.1:3002'))

		const { body, status } = bodyOf(await submit({ intent: 'revoke' }))

		expect(status).toBe(500)
		expect(body).toEqual({ ok: false, error: 'Erreur serveur' })
	})
})
