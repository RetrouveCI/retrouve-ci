import { redirect } from 'react-router'

const { requireAdminSession } = vi.hoisted(() => ({
	requireAdminSession: vi.fn(),
}))

vi.mock('@/shared/helpers/session.server', () => ({ requireAdminSession }))

const { profileLoader } = await import('../profile.loader')

const USER = {
	id: 'adm-1',
	name: 'Super Admin',
	email: 'admin@retrouveci.com',
	role: 'admin',
}

function requestFor() {
	return new Request('http://localhost:3001/profile', {
		headers: { cookie: 'retrouveci-admin.session_token=abc' },
	})
}

beforeEach(() => {
	requireAdminSession.mockReset().mockResolvedValue({ user: USER })
})

afterEach(() => {
	vi.restoreAllMocks()
})

describe('profileLoader', () => {
	// The whole page is session data: there is no API call to make.
	it('reads the user off the session the gate returns', async () => {
		const request = requestFor()

		expect(await profileLoader({ request })).toEqual({ user: USER })
		expect(requireAdminSession).toHaveBeenCalledWith(request)
	})

	it('propagates the gate’s redirect', async () => {
		const redirect = new Response(null, { status: 302 })
		requireAdminSession.mockRejectedValue(redirect)

		await expect(profileLoader({ request: requestFor() })).rejects.toBe(
			redirect,
		)
	})
})
