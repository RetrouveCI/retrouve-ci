import type { ActionResult } from '@/shared/types/action'
import { ApiError } from '@/shared/utils/api-fetch'

const { requireServerSession, activateSticker, updateSticker, revokeSticker } =
	vi.hoisted(() => ({
		requireServerSession: vi.fn(),
		activateSticker: vi.fn(),
		updateSticker: vi.fn(),
		revokeSticker: vi.fn(),
	}))

vi.mock('@/shared/helpers/session.server', () => ({ requireServerSession }))
vi.mock('../stickers.service', () => ({
	activateSticker,
	updateSticker,
	revokeSticker,
}))

const { stickersAction } = await import('../stickers.action')

function submit(fields: Record<string, string>) {
	const body = new FormData()
	for (const [key, value] of Object.entries(fields)) body.append(key, value)

	return stickersAction({
		request: new Request('http://localhost:3000/account/stickers', {
			method: 'POST',
			body,
		}),
	})
}

function errorsOf(result: ActionResult) {
	if (result.success) throw new Error('expected the action to report an error')
	return result.errors ?? {}
}

beforeEach(() => {
	requireServerSession.mockReset().mockResolvedValue({ user: { id: 'user-1' } })
	activateSticker.mockReset().mockResolvedValue({ code: 'RCI-ABC123' })
	updateSticker.mockReset().mockResolvedValue({ code: 'RCI-ABC123' })
	revokeSticker.mockReset().mockResolvedValue({ code: 'RCI-ABC123' })
})

afterEach(() => {
	vi.restoreAllMocks()
})

describe('stickersAction', () => {
	it('gates on the session before reading the body', async () => {
		const redirect = new Response(null, {
			status: 302,
			headers: { location: '/login?redirectTo=%2Faccount%2Fstickers' },
		})
		requireServerSession.mockRejectedValue(redirect)

		const thrown = await submit({
			intent: 'revoke',
			code: 'RCI-ABC123',
		}).catch((error: unknown) => error)

		expect(thrown).toBe(redirect)
		expect(revokeSticker).not.toHaveBeenCalled()
	})

	it('reads the session through the shared gate, not its own', async () => {
		await submit({ intent: 'revoke', code: 'RCI-ABC123' })

		expect(requireServerSession).toHaveBeenCalledTimes(1)
	})

	describe('activate', () => {
		it('sends the label and the linked object', async () => {
			const result = await submit({
				intent: 'activate',
				code: 'RCI-ABC123',
				label: 'Mes clés',
				linkedObject: 'trousseau',
			})

			expect(result).toEqual({ success: true })
			expect(activateSticker).toHaveBeenCalledWith(
				'RCI-ABC123',
				{ label: 'Mes clés', linkedObject: 'trousseau', directContact: false },
				expect.any(Request),
			)
			expect(updateSticker).not.toHaveBeenCalled()
		})

		// The API wants the key absent, not an empty string.
		it('sends undefined for a linked object left blank', async () => {
			await submit({
				intent: 'activate',
				code: 'RCI-ABC123',
				label: 'Mes clés',
				linkedObject: '',
			})

			const [, content] = activateSticker.mock.calls[0] as [
				string,
				{ linkedObject?: string },
			]
			expect(content.linkedObject).toBeUndefined()
		})
	})

	// Same payload, different verb — the sticker is already activated.
	it('updates through PATCH rather than activating twice', async () => {
		const result = await submit({
			intent: 'update',
			code: 'RCI-ABC123',
			label: 'Sac de sport',
		})

		expect(result).toEqual({ success: true })
		expect(updateSticker).toHaveBeenCalledWith(
			'RCI-ABC123',
			{
				label: 'Sac de sport',
				linkedObject: undefined,
				directContact: false,
			},
			expect.any(Request),
		)
		expect(activateSticker).not.toHaveBeenCalled()
	})

	it('revokes with the code alone, sending no content', async () => {
		const result = await submit({ intent: 'revoke', code: 'RCI-ABC123' })

		expect(result).toEqual({ success: true })
		expect(revokeSticker).toHaveBeenCalledWith(
			'RCI-ABC123',
			expect.any(Request),
		)
	})

	// The discriminated union is what keeps `revoke` from needing a label.
	it.each(['activate', 'update'] as const)(
		'refuses %s with no label',
		async intent => {
			const result = await submit({ intent, code: 'RCI-ABC123' })

			expect(result.success).toBe(false)
			expect(activateSticker).not.toHaveBeenCalled()
			expect(updateSticker).not.toHaveBeenCalled()
		},
	)

	it('refuses an intent the union does not know', async () => {
		const result = await submit({ intent: 'transfer', code: 'RCI-ABC123' })

		expect(result.success).toBe(false)
		expect(revokeSticker).not.toHaveBeenCalled()
	})

	it('reports an API refusal as a root error', async () => {
		revokeSticker.mockRejectedValue(new ApiError(403, 'Pas votre sticker'))

		expect(
			errorsOf(await submit({ intent: 'revoke', code: 'RCI-ABC123' })).root
				?.message,
		).toBe('Pas votre sticker')
	})

	// A session that died between the gate and the call belongs on the login page.
	it('redirects to login when the API answers 401', async () => {
		activateSticker.mockRejectedValue(new ApiError(401, 'Unauthorized'))

		await expect(
			submit({ intent: 'activate', code: 'RCI-ABC123', label: 'Mes clés' }),
		).rejects.toBeInstanceOf(Response)
	})

	it('refuses a name too short to identify a sticker', async () => {
		const result = await submit({
			intent: 'activate',
			code: 'RCI-ABC123',
			label: 'x',
		})

		expect(errorsOf(result).label?.message).toBe('Donnez un nom à ce sticker')
		expect(activateSticker).not.toHaveBeenCalled()
	})

	it('lets a non-API failure through', async () => {
		updateSticker.mockRejectedValue(new Error('boom'))

		await expect(
			submit({ intent: 'update', code: 'RCI-ABC123', label: 'Sac' }),
		).rejects.toThrow('boom')
	})
})

// The chain, end to end: the API refuses on `code`, `ApiError` carries the map,
// and the dialog's own `code` field renders it — where it read « QR token
// "RCI-ABC123" is already activated » in a banner.
describe('a refusal the API lands on a field', () => {
	it('puts the message on the code field, not in the banner', async () => {
		activateSticker.mockRejectedValue(
			new ApiError(400, 'Ce sticker est déjà activé', {
				code: ['Ce sticker est déjà activé'],
			}),
		)

		const errors = errorsOf(
			await submit({ intent: 'activate', code: 'RCI-ABC123', label: 'Clés' }),
		)

		expect(errors['code']?.message).toBe('Ce sticker est déjà activé')
		expect(errors['root']).toBeUndefined()
	})

	it('keeps a refusal with no field in the banner', async () => {
		activateSticker.mockRejectedValue(new ApiError(500, 'Service indisponible'))

		const errors = errorsOf(
			await submit({ intent: 'activate', code: 'RCI-ABC123', label: 'Clés' }),
		)

		expect(errors['root']?.message).toBe('Service indisponible')
		expect(errors['code']).toBeUndefined()
	})
})
