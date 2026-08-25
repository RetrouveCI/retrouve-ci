import type { UserProfile } from '../../mappers/profile.mapper'

const { requireServerSession } = vi.hoisted(() => ({
	requireServerSession: vi.fn(),
}))

vi.mock('@/shared/helpers/session.server', () => ({ requireServerSession }))

const { settingsLoader } = await import('../settings.loader')

const request = () => new Request('http://localhost:3000/account/settings')

const sessionUser = (overrides: Record<string, unknown> = {}) => ({
	user: {
		name: 'Awa Traoré',
		email: 'awa@example.com',
		phoneNumber: '+2250700000000',
		phoneNumberVerified: true,
		city: 'Abidjan',
		commune: 'Cocody',
		createdAt: '2026-03-15T10:00:00.000Z',
		...overrides,
	},
})

beforeEach(() => {
	requireServerSession.mockReset().mockResolvedValue(sessionUser())
})

afterEach(() => {
	vi.restoreAllMocks()
})

describe('settingsLoader', () => {
	it('gates on the session', async () => {
		const req = request()

		await settingsLoader({ request: req })

		expect(requireServerSession).toHaveBeenCalledWith(req)
	})

	it('propagates the redirect an expired session throws', async () => {
		const redirect = new Response(null, { status: 302 })
		requireServerSession.mockRejectedValue(redirect)

		await expect(settingsLoader({ request: request() })).rejects.toBe(redirect)
	})

	it('hands the form the profile behind the session', async () => {
		const { user } = await settingsLoader({ request: request() })

		expect(user).toMatchObject<Partial<UserProfile>>({
			name: 'Awa Traoré',
			email: 'awa@example.com',
			phone: '+2250700000000',
			phoneVerified: true,
			city: 'Abidjan',
			commune: 'Cocody',
		})
	})

	it('composes the zone from the commune and the city', async () => {
		const { user } = await settingsLoader({ request: request() })

		expect(user.zone).toContain('Cocody')
		expect(user.zone).toContain('Abidjan')
	})

	// A phone sign-up leaves both empty until the account page is filled in.
	it('reports an unset zone rather than inventing one', async () => {
		requireServerSession.mockResolvedValue(
			sessionUser({ city: null, commune: null }),
		)

		const { user } = await settingsLoader({ request: request() })

		expect(user.zone).toBeNull()
	})

	it('reports an unverified phone as false, never null', async () => {
		requireServerSession.mockResolvedValue(
			sessionUser({ phoneNumberVerified: null }),
		)

		const { user } = await settingsLoader({ request: request() })

		expect(user.phoneVerified).toBe(false)
	})

	it('renders the membership date in French, capitalised', async () => {
		const { user } = await settingsLoader({ request: request() })

		expect(user.memberSince).toBe('Mars 2026')
	})
})
