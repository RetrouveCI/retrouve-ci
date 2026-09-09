import { ApiError } from '@/shared/utils/api-fetch'
import type { ActionResult } from '@/shared/types/action'

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

const rootOf = (result: ActionResult) =>
	result.success ? undefined : result.errors?.root?.message

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

	it('bans the given user, handing the request down', async () => {
		expect(await submit({ intent: 'ban', userId: 'user-1' })).toEqual({
			success: true,
		})
		expect(banUser).toHaveBeenCalledWith(expect.any(Request), 'user-1')
		expect(unbanUser).not.toHaveBeenCalled()
	})

	it('unbans the given user', async () => {
		expect(await submit({ intent: 'unban', userId: 'user-1' })).toEqual({
			success: true,
		})
		expect(unbanUser).toHaveBeenCalledWith(expect.any(Request), 'user-1')
		expect(banUser).not.toHaveBeenCalled()
	})

	// The id check runs before the intent check, so a missing id is reported as
	// such even for an intent the action would have refused anyway.
	it.each(['ban', 'unban', 'supprimer', ''])(
		'names the missing id for intent %p',
		async intent => {
			expect(rootOf(await submit({ intent }))).toBe('ID manquant')
			expect(banUser).not.toHaveBeenCalled()
			expect(unbanUser).not.toHaveBeenCalled()
		},
	)

	it('names an unknown intent', async () => {
		expect(
			rootOf(await submit({ intent: 'supprimer', userId: 'user-1' })),
		).toBe('Intent inconnu')
	})

	it('reports an API refusal as a root error', async () => {
		banUser.mockRejectedValue(new ApiError(409, 'Ce compte est protégé'))

		expect(rootOf(await submit({ intent: 'ban', userId: 'u' }))).toBe(
			'Ce compte est protégé',
		)
	})

	// Anything that is not an `ApiError` is a bug, not an outcome: it reaches the
	// error boundary rather than a toast, as every client action already does.
	it('lets a non-API failure through to the error boundary', async () => {
		banUser.mockRejectedValue(new Error('ban-user exploded'))

		await expect(submit({ intent: 'ban', userId: 'u' })).rejects.toThrow(
			'ban-user exploded',
		)
	})

	// The debt this closes: with no `redirectOnUnauthorized`, a dead backoffice
	// session surfaced as a 500 inside a dashboard the visitor could not see.
	it('sends a dead session back to the login page', async () => {
		banUser.mockRejectedValue(new ApiError(401, 'Unauthorized'))

		const thrown: unknown = await submit({
			intent: 'ban',
			userId: 'user-1',
		}).catch((error: unknown) => error)

		expect(thrown).toBeInstanceOf(Response)
		expect((thrown as Response).headers.get('location')).toBe('/login')
	})
})
