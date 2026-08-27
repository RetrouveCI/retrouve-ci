import type { ActionResult } from '@/shared/types/action'
import { ApiError } from '@/shared/utils/api-fetch'

/** `errors` lives on the failure branch of the union only. */
const errorsOf = (result: ActionResult) =>
	result.success ? undefined : result.errors

const { submitContactMessage } = vi.hoisted(() => ({
	submitContactMessage: vi.fn(),
}))

vi.mock('../contact.service', () => ({ submitContactMessage }))

const { contactAction } = await import('../contact.action')

const VALID = {
	name: 'Awa Traoré',
	email: 'awa@example.com',
	subject: 'Question sur une annonce',
	message: 'Bonjour, je souhaite en savoir plus sur cette annonce.',
}

function requestFor(fields: Record<string, string> = VALID) {
	const body = new FormData()
	for (const [key, value] of Object.entries(fields)) body.append(key, value)
	return new Request('http://localhost:3000/contact', {
		method: 'POST',
		body,
	})
}

beforeEach(() => {
	submitContactMessage.mockReset().mockResolvedValue(undefined)
})

afterEach(() => {
	vi.restoreAllMocks()
})

describe('contactAction', () => {
	// The page is public: no session, by design.
	it('accepts a message from an anonymous visitor', async () => {
		const result = await contactAction({ request: requestFor() })

		expect(result).toEqual({ success: true })
		expect(submitContactMessage).toHaveBeenCalledWith(
			VALID,
			expect.any(Request),
		)
	})

	// The contract trims, and the trimmed value is what reaches the API.
	it('trims what the visitor typed', async () => {
		await contactAction({
			request: requestFor({ ...VALID, name: '  Awa Traoré  ' }),
		})

		expect(submitContactMessage.mock.calls[0]?.[0].name).toBe('Awa Traoré')
	})

	it.each([
		['name', { name: 'A' }],
		['email', { email: 'pas-un-email' }],
		['email', { email: '' }],
		['subject', { subject: 'x' }],
		['message', { message: 'court' }],
	])('refuses an invalid %s without sending', async (field, override) => {
		const result = await contactAction({
			request: requestFor({ ...VALID, ...override }),
		})

		expect(result.success).toBe(false)
		expect(errorsOf(result)?.[field]).toBeDefined()
		expect(submitContactMessage).not.toHaveBeenCalled()
	})

	it('reports an API refusal as a root error', async () => {
		submitContactMessage.mockRejectedValue(
			new ApiError(429, 'Trop de messages'),
		)

		const result = await contactAction({ request: requestFor() })

		expect(result).toEqual({
			success: false,
			errors: { root: { type: 'custom', message: 'Trop de messages' } },
		})
	})

	it('lets a non-API failure through', async () => {
		submitContactMessage.mockRejectedValue(new Error('boom'))

		await expect(contactAction({ request: requestFor() })).rejects.toThrow(
			'boom',
		)
	})
})
