import { ApiError } from '@/shared/utils/api-fetch'

const { reachQrOwner } = vi.hoisted(() => ({ reachQrOwner: vi.fn() }))

vi.mock('../qr-contact.service', () => ({ reachQrOwner }))

const { action, loader } = await import('../qr-reach.action')

const CODE = 'RCI-ABC123'

function jump(channel?: string) {
	const body = new FormData()
	if (channel !== undefined) body.append('channel', channel)

	return action({
		request: new Request(`http://localhost:3000/q/${CODE}/reach`, {
			method: 'POST',
			body,
		}),
		params: { code: CODE },
	})
}

beforeEach(() => {
	reachQrOwner.mockReset().mockResolvedValue('tel:+2250700000000')
})

afterEach(() => {
	vi.restoreAllMocks()
})

describe('the reach action', () => {
	// The number leaves as a `Location` header, never as a payload.
	it.each([
		['call', 'tel:+2250700000000'],
		['whatsapp', 'https://wa.me/2250700000000?text=Bonjour'],
	])('redirects a %s straight to its target', async (channel, target) => {
		reachQrOwner.mockResolvedValue(target)

		const response = await jump(channel)

		expect(response.status).toBe(302)
		expect(response.headers.get('Location')).toBe(target)
		expect(reachQrOwner).toHaveBeenCalledWith(
			CODE,
			channel,
			expect.any(Request),
		)
	})

	// Nothing is echoed back into a body, so nothing can be read off the answer.
	it('answers no content beside the header', async () => {
		expect(await (await jump('call')).text()).toBe('')
	})

	it.each([['sms'], ['']])(
		'sends an unknown channel %o back without calling the API',
		async channel => {
			const response = await jump(channel)

			expect(response.headers.get('Location')).toBe(`/q/${CODE}?reach=failed`)
			expect(reachQrOwner).not.toHaveBeenCalled()
		},
	)

	it('sends a body with no channel back the same way', async () => {
		expect((await jump()).headers.get('Location')).toBe(
			`/q/${CODE}?reach=failed`,
		)
	})

	// The one failure worth naming apart, being the one worth waiting out.
	it('names a 429 apart', async () => {
		reachQrOwner.mockRejectedValue(new ApiError(429, 'Trop de tentatives'))

		expect((await jump('call')).headers.get('Location')).toBe(
			`/q/${CODE}?reach=throttled`,
		)
	})

	it.each([403, 400, 500])(
		'folds a %i into the plain failure',
		async status => {
			reachQrOwner.mockRejectedValue(new ApiError(status, 'boom'))

			expect((await jump('call')).headers.get('Location')).toBe(
				`/q/${CODE}?reach=failed`,
			)
		},
	)

	// A finder must never meet an error boundary here.
	it('folds a non-API failure into it too', async () => {
		reachQrOwner.mockRejectedValue(new Error('network down'))

		expect((await jump('call')).headers.get('Location')).toBe(
			`/q/${CODE}?reach=failed`,
		)
	})

	it('sends a GET back to the contact screen', () => {
		const response = loader({ params: { code: CODE } })

		expect(response.status).toBe(302)
		expect(response.headers.get('Location')).toBe(`/q/${CODE}`)
	})
})
