import { ApiError } from '@/shared/utils/api-fetch'
import type { ActionResult } from '@/shared/types/action'

const rootOf = (result: ActionResult<unknown>) =>
	result.success ? undefined : result.errors?.root?.message

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
		expect(await submit({ intent: 'revoke' }, 'RCI-XYZ789')).toEqual({
			success: true,
			data: { code: 'RCI-ABC123', status: 'revoked' },
		})
		expect(revokeQrToken).toHaveBeenCalledWith(
			'RCI-XYZ789',
			expect.any(Request),
		)
	})

	it.each(['activate', '', 'delete'])(
		'names an unknown intent %p, revoking nothing',
		async intent => {
			expect(rootOf(await submit({ intent }))).toBe('Intent inconnu')
			expect(revokeQrToken).not.toHaveBeenCalled()
		},
	)

	/**
	 * The API refuses a token that is not the caller's, and its own message names
	 * the code. The visitor gets a sentence about what they may do instead.
	 */
	it('rewrites a 403 into an explanation', async () => {
		revokeQrToken.mockRejectedValue(new ApiError(403, 'Forbidden'))

		expect(rootOf(await submit({ intent: 'revoke' }))).toBe(
			'Vous ne pouvez pas révoquer ce token.',
		)
	})

	it.each([404, 400])('reports a %i as a root error', async statusCode => {
		revokeQrToken.mockRejectedValue(new ApiError(statusCode, 'Token inconnu'))

		expect(rootOf(await submit({ intent: 'revoke' }))).toBe('Token inconnu')
	})

	it('sends a dead session back to the login page', async () => {
		revokeQrToken.mockRejectedValue(new ApiError(401, 'Unauthorized'))

		await expect(submit({ intent: 'revoke' })).rejects.toBeInstanceOf(Response)
	})

	// A stack trace is not an outcome: it reaches the error boundary, which
	// React Router sanitises before the browser sees it.
	it('lets a non-API failure through', async () => {
		revokeQrToken.mockRejectedValue(new Error('ECONNREFUSED 127.0.0.1:3002'))

		await expect(submit({ intent: 'revoke' })).rejects.toThrow('ECONNREFUSED')
	})
})
