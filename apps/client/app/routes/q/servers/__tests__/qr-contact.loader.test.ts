import { ApiError } from '@/shared/utils/api-fetch'

const { getQrTokenPublicView } = vi.hoisted(() => ({
	getQrTokenPublicView: vi.fn(),
}))

vi.mock('../qr-contact.service', () => ({ getQrTokenPublicView }))

const { qrContactLoader } = await import('../qr-contact.loader')

const TOKEN = {
	status: 'activated' as const,
	ownerFirstName: 'Awa',
	label: 'Mes clés',
	linkedObject: 'trousseau',
}

beforeEach(() => {
	getQrTokenPublicView.mockReset().mockResolvedValue(TOKEN)
})

afterEach(() => {
	vi.restoreAllMocks()
})

describe('qrContactLoader', () => {
	// Deliberately ungated: whoever finds the object is a stranger.
	it('reads the public view for the scanned code', async () => {
		expect(await qrContactLoader({ params: { code: 'RCI-ABC123' } })).toEqual({
			token: TOKEN,
		})
		expect(getQrTokenPublicView).toHaveBeenCalledWith('RCI-ABC123')
	})

	/**
	 * An unknown code is a wrong sticker, not a broken app: the 404 boundary is
	 * what tells the finder to check the code, where a 500 would say nothing.
	 */
	it('turns a 404 from the API into a 404 response', async () => {
		getQrTokenPublicView.mockRejectedValue(new ApiError(404, 'Not found'))

		// `data()` yields a DataWithResponseInit; react-router builds the Response.
		let thrown: { data?: unknown; init?: { status?: number } } | undefined
		await qrContactLoader({ params: { code: 'RCI-NOPE' } }).catch(
			(error: unknown) => {
				thrown = error as { data?: unknown; init?: { status?: number } }
			},
		)

		expect(thrown?.init?.status).toBe(404)
		expect(thrown?.data).toBeNull()
	})

	// Anything else is the app's problem and must not be dressed up as a bad code.
	it.each([500, 502, 401])('rethrows a %i untouched', async status => {
		const error = new ApiError(status, 'boom')
		getQrTokenPublicView.mockRejectedValue(error)

		await expect(
			qrContactLoader({ params: { code: 'RCI-ABC123' } }),
		).rejects.toBe(error)
	})

	it('rethrows a non-API failure untouched', async () => {
		const error = new Error('network down')
		getQrTokenPublicView.mockRejectedValue(error)

		await expect(
			qrContactLoader({ params: { code: 'RCI-ABC123' } }),
		).rejects.toBe(error)
	})
})
