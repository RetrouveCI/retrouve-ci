import type { PendingStickerCount } from '../pending-count.loader'

const { getServerSession, getMyStickerSummary } = vi.hoisted(() => ({
	getServerSession: vi.fn(),
	getMyStickerSummary: vi.fn(),
}))

vi.mock('@/shared/helpers/session.server', () => ({ getServerSession }))
vi.mock('../stickers.service', () => ({ getMyStickerSummary }))

const { loader } = await import('../pending-count.loader')

const request = new Request('http://localhost/account/stickers/pending')

const expectCount = async (pending: number) =>
	expect(await loader({ request })).toEqual<PendingStickerCount>({ pending })

beforeEach(() => {
	getServerSession.mockReset().mockResolvedValue(null)
	getMyStickerSummary.mockReset()
})

describe('the pending sticker count', () => {
	it('asks the API nothing for an anonymous visitor', async () => {
		await expectCount(0)
		expect(getMyStickerSummary).not.toHaveBeenCalled()
	})

	it('carries what is left to activate', async () => {
		getServerSession.mockResolvedValue({ user: { id: 'user-1' } })
		getMyStickerSummary.mockResolvedValue({
			delivered: 12,
			activated: 3,
			pending: 9,
		})

		await expectCount(9)
	})

	// A badge must never take the shell down, on either leg of the read.
	it.each([
		['the summary fails', () => getMyStickerSummary],
		['the session check throws', () => getServerSession],
	])('answers zero when %s', async (_label, pick) => {
		getServerSession.mockResolvedValue({ user: { id: 'user-1' } })
		pick().mockRejectedValue(new Error('ECONNREFUSED'))

		await expectCount(0)
	})
})
