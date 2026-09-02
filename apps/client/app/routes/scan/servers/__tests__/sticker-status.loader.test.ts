import type { StickerStatus } from '@/shared/types/sticker'

const { getQrTokenPublicView } = vi.hoisted(() => ({
	getQrTokenPublicView: vi.fn(),
}))

vi.mock('../../../q/servers/qr-contact.service', () => ({
	getQrTokenPublicView,
}))

const { loader } = await import('../sticker-status.loader')

function requestFor(code: string) {
	return new Request(
		`http://localhost:3000/scan/status?code=${encodeURIComponent(code)}`,
	)
}

beforeEach(() => {
	getQrTokenPublicView.mockReset().mockResolvedValue({
		status: 'generated',
		ownerFirstName: null,
		label: null,
		linkedObject: null,
	})
})

afterEach(() => {
	vi.restoreAllMocks()
})

describe('sticker-status loader', () => {
	it('answers the status of a sticker still waiting', async () => {
		await expect(
			loader({ request: requestFor('RCI-ABC123') }),
		).resolves.toEqual({ code: 'RCI-ABC123', status: 'generated' })
	})

	it.each<StickerStatus>(['activated', 'revoked'])(
		'carries %s through',
		async status => {
			getQrTokenPublicView.mockResolvedValue({
				status,
				ownerFirstName: 'Awa',
				label: null,
				linkedObject: null,
			})

			await expect(
				loader({ request: requestFor('RCI-ABC123') }),
			).resolves.toEqual({ code: 'RCI-ABC123', status })
		},
	)

	/** The same parser the camera and the field use, so all three agree. */
	it('normalises a scanned URL down to its code', async () => {
		await loader({ request: requestFor('https://retrouve.ci/q/RCI-ABC123') })

		expect(getQrTokenPublicView).toHaveBeenCalledWith('RCI-ABC123')
	})

	it('asks the API nothing about a code that is not a sticker', async () => {
		const answer = await loader({ request: requestFor('HELLO') })

		expect(answer.status).toBeNull()
		expect(getQrTokenPublicView).not.toHaveBeenCalled()
	})

	it('answers nothing rather than throwing when the API is unreachable', async () => {
		getQrTokenPublicView.mockRejectedValue(new Error('ECONNREFUSED'))

		await expect(
			loader({ request: requestFor('RCI-ABC123') }),
		).resolves.toEqual({ code: 'RCI-ABC123', status: null })
	})

	it('echoes the code back, so an answer cannot be read as a previous one', async () => {
		const answer = await loader({ request: requestFor('rci abc123') })

		expect(answer.code).toBe('RCI-ABC123')
	})
})
