import { LOST_ITEM_CATEGORIES } from '@app/contracts/lost-items'

const { requireAdminSession, apiFetch } = vi.hoisted(() => ({
	requireAdminSession: vi.fn(),
	apiFetch: vi.fn(),
}))

vi.mock('@/shared/helpers/session.server', () => ({ requireAdminSession }))
vi.mock('@/shared/utils/api-fetch', () => ({ apiFetch }))

const { dashboardLoader } = await import('../dashboard.loader')

const COOKIE = 'retrouveci-admin.session_token=abc'
const ZERO = { value: 0, change: 0 }

function statsResponse(overrides: Record<string, unknown> = {}) {
	return {
		qrGenerated: ZERO,
		qrActivated: ZERO,
		scans: ZERO,
		contacts: ZERO,
		postsLost: ZERO,
		postsFound: ZERO,
		newUsers: ZERO,
		activityChart: [],
		categoryChart: [],
		recentActivities: [],
		...overrides,
	}
}

function requestFor() {
	return new Request('http://localhost:3001/', { headers: { cookie: COOKIE } })
}

beforeEach(() => {
	requireAdminSession.mockReset().mockResolvedValue(undefined)
	apiFetch.mockReset().mockResolvedValue(statsResponse())
})

afterEach(() => {
	vi.useRealTimers()
	vi.restoreAllMocks()
})

describe('dashboardLoader', () => {
	it('gates on the admin session before reading anything', async () => {
		const request = requestFor()

		await dashboardLoader({ request })

		expect(requireAdminSession).toHaveBeenCalledWith(request)
	})

	it('does not read the stats when the session is refused', async () => {
		const redirect = new Response(null, { status: 302 })
		requireAdminSession.mockRejectedValue(redirect)

		await expect(dashboardLoader({ request: requestFor() })).rejects.toBe(
			redirect,
		)
		expect(apiFetch).not.toHaveBeenCalled()
	})

	// `/stats`, not `/api/stats`: the API has no global prefix.
	it('reads /stats with the session cookie forwarded', async () => {
		await dashboardLoader({ request: requestFor() })

		expect(apiFetch).toHaveBeenCalledWith('/stats', {
			headers: { Cookie: COOKIE },
		})
	})

	it('keeps the seven counters the tiles read', async () => {
		const result = await dashboardLoader({ request: requestFor() })

		expect(Object.keys(result.stats)).toEqual([
			'qrGenerated',
			'qrActivated',
			'scans',
			'contacts',
			'postsLost',
			'postsFound',
			'newUsers',
		])
	})

	it('passes the activity chart through untouched', async () => {
		const activityChart = [{ date: '2026-08-01', scans: 3, activations: 1 }]
		apiFetch.mockResolvedValue(statsResponse({ activityChart }))

		expect(
			(await dashboardLoader({ request: requestFor() })).activityChart,
		).toEqual(activityChart)
	})

	/**
	 * The guard the table's type does not give: it is a `Record<string, string>`,
	 * so a category added to the contract would fall through to `?? row.category`
	 * and show a French admin the raw Prisma enum — `JEWELRY`, not `Bijoux`.
	 * `posts.const.ts` types its own table against `LostItemCategory` instead.
	 */
	it('has a French label for every category the contract knows', async () => {
		apiFetch.mockResolvedValue(
			statsResponse({
				categoryChart: LOST_ITEM_CATEGORIES.map(category => ({
					category: category.toUpperCase(),
					lost: 0,
					found: 0,
				})),
			}),
		)

		const { categoryChart } = await dashboardLoader({ request: requestFor() })

		expect(categoryChart).toHaveLength(LOST_ITEM_CATEGORIES.length)
		for (const row of categoryChart) {
			expect(row.category).not.toMatch(/^[A-Z_]+$/)
		}
	})

	it('falls back to the raw value for a category it has no label for', async () => {
		apiFetch.mockResolvedValue(
			statsResponse({
				categoryChart: [{ category: 'BICYCLE', lost: 2, found: 0 }],
			}),
		)

		const { categoryChart } = await dashboardLoader({ request: requestFor() })

		expect(categoryChart).toEqual([{ category: 'BICYCLE', lost: 2, found: 0 }])
	})

	it('renumbers the activities by position, dropping the API ids', async () => {
		vi.useFakeTimers()
		vi.setSystemTime(new Date('2026-08-26T12:00:00Z'))
		apiFetch.mockResolvedValue(
			statsResponse({
				recentActivities: [
					{
						id: 'act-a',
						type: 'scan',
						text: 'Sticker scanné',
						createdAt: '2026-08-26T11:00:00Z',
					},
					{
						id: 'act-b',
						type: 'post',
						text: 'Annonce publiée',
						createdAt: '2026-08-25T12:00:00Z',
					},
				],
			}),
		)

		const { activities } = await dashboardLoader({ request: requestFor() })

		expect(activities.map(a => a.id)).toEqual([1, 2])
		expect(activities[0]?.text).toBe('Sticker scanné')
	})

	// The relative timestamp is the reason `date-fns/locale/fr` is imported.
	it('renders the activity timestamps in French, relative and suffixed', async () => {
		vi.useFakeTimers()
		vi.setSystemTime(new Date('2026-08-26T12:00:00Z'))
		apiFetch.mockResolvedValue(
			statsResponse({
				recentActivities: [
					{
						id: 'act-a',
						type: 'scan',
						text: 'Sticker scanné',
						createdAt: '2026-08-26T11:00:00Z',
					},
				],
			}),
		)

		const { activities } = await dashboardLoader({ request: requestFor() })

		expect(activities[0]?.timestamp).toBe('il y a environ 1 heure')
	})

	/**
	 * The same exposure #120 was: `formatDistanceToNow(new Date(bad))` raises
	 * `RangeError` during SSR and takes the whole dashboard down. This API cannot
	 * produce it — `reporting.repository.ts` sends `created_at.toISOString()` —
	 * so the loader carries no guard, and this states that plainly.
	 */
	it('throws on an unparseable activity date rather than skipping the row', async () => {
		apiFetch.mockResolvedValue(
			statsResponse({
				recentActivities: [
					{ id: 'a', type: 'scan', text: 'x', createdAt: 'pas-une-date' },
				],
			}),
		)

		await expect(dashboardLoader({ request: requestFor() })).rejects.toThrow(
			RangeError,
		)
	})

	it('lets an API failure through to the error boundary', async () => {
		apiFetch.mockRejectedValue(new Error('stats down'))

		await expect(dashboardLoader({ request: requestFor() })).rejects.toThrow(
			'stats down',
		)
	})
})
