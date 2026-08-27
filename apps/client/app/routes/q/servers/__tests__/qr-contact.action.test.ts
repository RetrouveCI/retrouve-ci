import type { ActionResult } from '@/shared/types/action'
import { ApiError } from '@/shared/utils/api-fetch'

const { contactQrOwner } = vi.hoisted(() => ({ contactQrOwner: vi.fn() }))

vi.mock('../qr-contact.service', () => ({ contactQrOwner }))

const { qrContactAction } = await import('../qr-contact.action')

const VALID = {
	name: 'Konan Yao',
	phone: '0700000001',
	message: 'Bonjour, j’ai trouvé votre trousseau devant la pharmacie.',
}

function submit(fields: Record<string, string>, code = 'RCI-ABC123') {
	const body = new FormData()
	for (const [key, value] of Object.entries(fields)) body.append(key, value)

	return qrContactAction({
		request: new Request(`http://localhost:3000/q/${code}`, {
			method: 'POST',
			body,
		}),
		params: { code },
	})
}

function errorsOf(result: ActionResult) {
	if (result.success) throw new Error('expected the action to report an error')
	return result.errors ?? {}
}

beforeEach(() => {
	contactQrOwner.mockReset().mockResolvedValue(undefined)
})

afterEach(() => {
	vi.restoreAllMocks()
})

describe('qrContactAction', () => {
	// Ungated on purpose: the finder has no account.
	it('sends the message for the scanned code', async () => {
		expect(await submit(VALID)).toEqual({ success: true })
		expect(contactQrOwner).toHaveBeenCalledWith('RCI-ABC123', VALID)
	})

	// The API wants the key absent, not an empty string.
	it('omits an email left blank rather than sending an empty string', async () => {
		await submit({ ...VALID, email: '' })

		const [, payload] = contactQrOwner.mock.calls[0] as [string, object]
		expect(payload).not.toHaveProperty('email')
	})

	it('sends an email that was typed', async () => {
		await submit({ ...VALID, email: 'konan@example.com' })

		const [, payload] = contactQrOwner.mock.calls[0] as [
			string,
			{ email?: string },
		]
		expect(payload.email).toBe('konan@example.com')
	})

	it('refuses an email that is not one', async () => {
		const result = await submit({ ...VALID, email: 'konan@' })

		expect(errorsOf(result).email?.message).toBeTruthy()
		expect(contactQrOwner).not.toHaveBeenCalled()
	})

	it.each(['', '123', '070000000000000'])(
		'refuses the phone %p, without calling the API',
		async phone => {
			const result = await submit({ ...VALID, phone })

			expect(errorsOf(result).phone?.message).toBeTruthy()
			expect(contactQrOwner).not.toHaveBeenCalled()
		},
	)

	it('refuses a message that is too short', async () => {
		const result = await submit({ ...VALID, message: 'hi' })

		expect(errorsOf(result).message?.message).toBeTruthy()
		expect(contactQrOwner).not.toHaveBeenCalled()
	})

	// The sticker not being activated is the API's call, and its French sentence
	// is what the finder must read.
	it('reports an API refusal as a root error', async () => {
		contactQrOwner.mockRejectedValue(
			new ApiError(400, "Ce sticker n'est pas encore activé"),
		)

		expect(errorsOf(await submit(VALID)).root?.message).toBe(
			"Ce sticker n'est pas encore activé",
		)
	})

	it('lets a non-API failure through', async () => {
		contactQrOwner.mockRejectedValue(new Error('boom'))

		await expect(submit(VALID)).rejects.toThrow('boom')
	})
})
