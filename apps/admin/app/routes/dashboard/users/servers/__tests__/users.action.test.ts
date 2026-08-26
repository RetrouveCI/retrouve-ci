import { ApiError } from '@/shared/utils/api-fetch'

const { requireAdminSession, banUser, unbanUser } = vi.hoisted(() => ({
	requireAdminSession: vi.fn(),
	banUser: vi.fn(),
	unbanUser: vi.fn(),
}))

vi.mock('@/shared/helpers/session.server', () => ({ requireAdminSession }))
vi.mock('../users.service', () => ({ banUser, unbanUser }))

const { usersAction } = await import('../users.action')

const COOKIE = 'retrouveci-admin.session_token=abc'
const ORIGIN = 'http://localhost:3001'

function submit(fields: Record<string, string>) {
	const body = new FormData()
	for (const [key, value] of Object.entries(fields)) body.append(key, value)

	return usersAction({
		request: new Request('http://localhost:3001/users', {
			method: 'POST',
			body,
			headers: { cookie: COOKIE, origin: ORIGIN },
		}),
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
	banUser.mockReset().mockResolvedValue(undefined)
	unbanUser.mockReset().mockResolvedValue(undefined)
})

afterEach(() => {
	vi.restoreAllMocks()
})

describe('usersAction', () => {
	it('gates on the admin session before doing anything', async () => {
		requireAdminSession.mockRejectedValue(new Response(null, { status: 302 }))

		await expect(
			submit({ intent: 'ban', userId: 'user-1' }),
		).rejects.toBeInstanceOf(Response)
		expect(banUser).not.toHaveBeenCalled()
	})

	it('bans the given user, forwarding cookie and origin', async () => {
		const { body } = bodyOf(await submit({ intent: 'ban', userId: 'user-1' }))

		expect(body).toEqual({ ok: true, intent: 'ban' })
		expect(banUser).toHaveBeenCalledWith(COOKIE, ORIGIN, 'user-1')
		expect(unbanUser).not.toHaveBeenCalled()
	})

	it('unbans the given user', async () => {
		const { body } = bodyOf(await submit({ intent: 'unban', userId: 'user-1' }))

		expect(body).toEqual({ ok: true, intent: 'unban' })
		expect(unbanUser).toHaveBeenCalledWith(COOKIE, ORIGIN, 'user-1')
		expect(banUser).not.toHaveBeenCalled()
	})

	// The id check runs before the intent check, so a missing id is reported as
	// such even for an intent the action would have refused anyway.
	it.each(['ban', 'unban', 'supprimer', ''])(
		'answers 400 for intent %p with no user id',
		async intent => {
			const { body, status } = bodyOf(await submit({ intent }))

			expect(status).toBe(400)
			expect(body).toEqual({ ok: false, error: 'ID manquant' })
			expect(banUser).not.toHaveBeenCalled()
			expect(unbanUser).not.toHaveBeenCalled()
		},
	)

	it('answers 400 for an unknown intent', async () => {
		const { body, status } = bodyOf(
			await submit({ intent: 'supprimer', userId: 'user-1' }),
		)

		expect(status).toBe(400)
		expect(body).toEqual({ ok: false, error: 'Intent inconnu' })
	})

	it('reports the service message on failure, as a 500', async () => {
		banUser.mockRejectedValue(new Error('ban-user exploded'))

		const { body, status } = bodyOf(
			await submit({ intent: 'ban', userId: 'u' }),
		)

		expect(status).toBe(500)
		expect(body).toEqual({ ok: false, error: 'ban-user exploded' })
	})

	/**
	 * Current behaviour, asserted rather than implied: unlike
	 * `administratorsAction`, this one has no `redirectOnUnauthorized`, so a dead
	 * backoffice session surfaces as a 500 inside a dashboard the visitor can no
	 * longer see instead of sending them to the login page.
	 */
	it('turns a 401 into a 500 rather than redirecting to login', async () => {
		banUser.mockRejectedValue(new ApiError(401, 'Unauthorized'))

		const { status } = bodyOf(await submit({ intent: 'ban', userId: 'user-1' }))

		expect(status).toBe(500)
	})
})
