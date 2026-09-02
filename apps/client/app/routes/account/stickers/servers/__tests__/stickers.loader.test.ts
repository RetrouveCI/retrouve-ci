import type { QrTokenApiDto } from '../../types/stickers.types'

const { requireServerSession, getMyStickers, getMyStickerSummary } = vi.hoisted(
	() => ({
		requireServerSession: vi.fn(),
		getMyStickers: vi.fn(),
		getMyStickerSummary: vi.fn(),
	}),
)

vi.mock('@/shared/helpers/session.server', () => ({ requireServerSession }))
vi.mock('../stickers.service', () => ({ getMyStickers, getMyStickerSummary }))

const { stickersLoader } = await import('../stickers.loader')

const SUMMARY = { delivered: 12, activated: 3, pending: 9 }

const DTO: QrTokenApiDto = {
	id: 'qr-1',
	code: 'RCI-ABC123',
	status: 'activated',
	batch: 'lot-aout',
	label: 'Mes clés',
	linkedObject: 'trousseau',
	userId: 'user-1',
	createdAt: '2026-08-01T10:00:00.000Z',
	activatedAt: '2026-08-02T10:00:00.000Z',
	revokedAt: null,
}

function requestFor() {
	return new Request('http://localhost:3000/account/stickers', {
		headers: { cookie: 'better-auth.session_token=abc' },
	})
}

beforeEach(() => {
	requireServerSession.mockReset().mockResolvedValue({ user: { id: 'user-1' } })
	getMyStickers.mockReset().mockResolvedValue([DTO])
	getMyStickerSummary.mockReset().mockResolvedValue(SUMMARY)
})

afterEach(() => {
	vi.restoreAllMocks()
})

describe('stickersLoader', () => {
	it('gates on the session before reading anything', async () => {
		const request = requestFor()

		await stickersLoader({ request })

		expect(requireServerSession).toHaveBeenCalledWith(request)
	})

	it('does not read the stickers when the session is refused', async () => {
		const redirect = new Response(null, { status: 302 })
		requireServerSession.mockRejectedValue(redirect)

		await expect(stickersLoader({ request: requestFor() })).rejects.toBe(
			redirect,
		)
		expect(getMyStickers).not.toHaveBeenCalled()
		expect(getMyStickerSummary).not.toHaveBeenCalled()
	})

	it('hands the request to the service', async () => {
		const request = requestFor()

		await stickersLoader({ request })

		expect(getMyStickers).toHaveBeenCalledWith(request)
		expect(getMyStickerSummary).toHaveBeenCalledWith(request)
	})

	/**
	 * The list holds only the tokens the visitor owns, and a sticker waiting to
	 * be activated has no owner: what is left to do can only come from the
	 * summary, which counts the delivered orders.
	 */
	it('carries the activation summary beside the list', async () => {
		const { summary } = await stickersLoader({ request: requestFor() })

		expect(summary).toEqual(SUMMARY)
	})

	/**
	 * `isActive` is the mapper's whole reason to exist: the page toggles on it,
	 * and only `activated` counts — a revoked sticker is not one you can use.
	 */
	it.each([
		['activated', true],
		['generated', false],
		['revoked', false],
	] as const)('derives isActive %s → %s', async (status, isActive) => {
		getMyStickers.mockResolvedValue([{ ...DTO, status }])

		const { stickers } = await stickersLoader({ request: requestFor() })

		expect(stickers[0]?.isActive).toBe(isActive)
		expect(stickers[0]?.status).toBe(status)
	})

	// `batch`, `userId`, `createdAt` and `revokedAt` are the API's business.
	it('exposes only the fields the page reads', async () => {
		const { stickers } = await stickersLoader({ request: requestFor() })

		expect(Object.keys(stickers[0] ?? {}).sort()).toEqual([
			'activatedAt',
			'code',
			'id',
			'isActive',
			'label',
			'linkedObject',
			'status',
		])
	})

	it('answers an empty list for an account with no sticker', async () => {
		getMyStickers.mockResolvedValue([])

		expect(await stickersLoader({ request: requestFor() })).toEqual({
			stickers: [],
			summary: SUMMARY,
		})
	})

	it('lets a service failure through to the error boundary', async () => {
		getMyStickers.mockRejectedValue(new Error('api down'))

		await expect(stickersLoader({ request: requestFor() })).rejects.toThrow(
			'api down',
		)
	})

	it('lets a failed summary through to the error boundary', async () => {
		getMyStickerSummary.mockRejectedValue(new Error('api down'))

		await expect(stickersLoader({ request: requestFor() })).rejects.toThrow(
			'api down',
		)
	})
})
