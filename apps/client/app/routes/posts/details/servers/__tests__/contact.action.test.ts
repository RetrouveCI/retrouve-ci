import { ApiError } from '@/shared/utils/api-fetch'

const { contactLostItemPoster } = vi.hoisted(() => ({
	contactLostItemPoster: vi.fn(),
}))

vi.mock('../../../servers/lost-items.service', () => ({
	contactLostItemPoster,
}))

const { action, loader } = await import('../contact.action')

const ID = 'lost-item-9'
const TARGET = 'https://wa.me/2250700000000?text=Bonjour'

const contact = () =>
	action({
		request: new Request(`http://localhost:3000/posts/${ID}/contact`, {
			method: 'POST',
		}),
		params: { id: ID },
	})

beforeEach(() => {
	contactLostItemPoster.mockReset().mockResolvedValue(TARGET)
})

afterEach(() => {
	vi.restoreAllMocks()
})

describe('the listing contact action', () => {
	it('redirects to the target the API answered', async () => {
		const response = await contact()

		expect(response.status).toBe(302)
		expect(response.headers.get('Location')).toBe(TARGET)
		expect(await response.text()).toBe('')
	})

	it('hands the request over, so the rate limiter sees the visitor', async () => {
		await contact()

		expect(contactLostItemPoster).toHaveBeenCalledWith(ID, expect.any(Request))
	})

	// The one failure worth naming apart, being the one worth waiting out.
	it('names a 429 apart', async () => {
		contactLostItemPoster.mockRejectedValue(new ApiError(429, 'Trop'))

		expect((await contact()).headers.get('Location')).toBe(
			`/posts/${ID}?contact=throttled`,
		)
	})

	it.each([400, 404, 500])(
		'folds a %i into the plain failure',
		async status => {
			contactLostItemPoster.mockRejectedValue(new ApiError(status, 'boom'))

			expect((await contact()).headers.get('Location')).toBe(
				`/posts/${ID}?contact=failed`,
			)
		},
	)

	// A reload of the opened tab, which used to render a `400` JSON page.
	it('sends a GET back to the listing', () => {
		const response = loader({ params: { id: ID } })

		expect(response.status).toBe(302)
		expect(response.headers.get('Location')).toBe(`/posts/${ID}`)
	})

	// A finder must never meet an error boundary in a fresh tab.
	it('folds a non-API failure into it too', async () => {
		contactLostItemPoster.mockRejectedValue(new Error('network down'))

		expect((await contact()).headers.get('Location')).toBe(
			`/posts/${ID}?contact=failed`,
		)
	})
})
