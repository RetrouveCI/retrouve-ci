import type { ActionResult } from '@/shared/types/action'
import { ApiError } from '@/shared/utils/api-fetch'

const { requireServerSession, activateSticker } = vi.hoisted(() => ({
	requireServerSession: vi.fn(),
	activateSticker: vi.fn(),
}))

vi.mock('@/shared/helpers/session.server', () => ({ requireServerSession }))
vi.mock('../../../account/stickers/servers/stickers.service', () => ({
	activateSticker,
}))

const { scanAction } = await import('../scan.action')

function requestWith(fields: Record<string, string>) {
	const body = new FormData()
	for (const [name, value] of Object.entries(fields)) body.append(name, value)

	return new Request('http://localhost:3000/scan', { method: 'POST', body })
}

const VALID = { code: 'RCI-ABC123', label: 'Clés de la maison' }

function errorsOf(result: ActionResult) {
	if (result.success) throw new Error('expected the action to report an error')
	return result.errors ?? {}
}

beforeEach(() => {
	requireServerSession.mockReset().mockResolvedValue({ user: { id: 'user-1' } })
	activateSticker.mockReset().mockResolvedValue({ code: 'RCI-ABC123' })
})

afterEach(() => {
	vi.restoreAllMocks()
})

describe('scanAction', () => {
	it('gates on the session before touching the API', async () => {
		const redirect = new Response(null, { status: 302 })
		requireServerSession.mockRejectedValue(redirect)

		await expect(scanAction({ request: requestWith(VALID) })).rejects.toBe(
			redirect,
		)
		expect(activateSticker).not.toHaveBeenCalled()
	})

	it('activates the sticker the sheet names', async () => {
		const request = requestWith(VALID)

		await expect(scanAction({ request })).resolves.toEqual({ success: true })
		expect(activateSticker).toHaveBeenCalledWith(
			'RCI-ABC123',
			{ label: 'Clés de la maison', linkedObject: undefined },
			request,
		)
	})

	it('sends a description through when one is given', async () => {
		await scanAction({
			request: requestWith({ ...VALID, linkedObject: 'Trousseau bleu' }),
		})

		expect(activateSticker).toHaveBeenCalledWith(
			'RCI-ABC123',
			{ label: 'Clés de la maison', linkedObject: 'Trousseau bleu' },
			expect.anything(),
		)
	})

	it('refuses a body with no name, on the field', async () => {
		const result = await scanAction({
			request: requestWith({ code: 'RCI-ABC123', label: '' }),
		})

		expect(errorsOf(result).label?.message).toBe('Donnez un nom à ce sticker')
		expect(activateSticker).not.toHaveBeenCalled()
	})

	/** The code is checked by the same parser the scanner reads with. */
	it('refuses a code that belongs to no sticker', async () => {
		const result = await scanAction({
			request: requestWith({ ...VALID, code: 'HELLO' }),
		})

		expect(result.success).toBe(false)
		expect(activateSticker).not.toHaveBeenCalled()
	})

	it('turns an API refusal into a root error', async () => {
		activateSticker.mockRejectedValue(
			new ApiError(400, 'Ce sticker est déjà activé'),
		)

		const result = await scanAction({ request: requestWith(VALID) })

		expect(errorsOf(result).root?.message).toBe('Ce sticker est déjà activé')
	})
})
