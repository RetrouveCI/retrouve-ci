import type { ActionResult, FormErrors } from '@/shared/types/action'
import { ApiError } from '@/shared/utils/api-fetch'

const { requestPasswordReset } = vi.hoisted(() => ({
	requestPasswordReset: vi.fn(),
}))

vi.mock('../forgot-password.service', () => ({ requestPasswordReset }))

const { forgotPasswordAction } = await import('../forgot-password.action')

function submit(fields: Record<string, string>) {
	const body = new FormData()
	for (const [key, value] of Object.entries(fields)) body.append(key, value)

	return forgotPasswordAction({
		request: new Request('http://localhost:3001/forgot-password', {
			method: 'POST',
			body,
		}),
	})
}

function errorsOf(result: ActionResult): FormErrors {
	if (result.success) throw new Error('expected the action to report an error')
	return result.errors ?? {}
}

beforeEach(() => {
	requestPasswordReset.mockReset().mockResolvedValue(undefined)
})

afterEach(() => {
	vi.restoreAllMocks()
})

describe('forgotPasswordAction', () => {
	// No session gate on purpose: this is how a locked-out admin gets back in.
	it('sends the reset request for a valid email', async () => {
		const result = await submit({ email: 'admin@retrouveci.com' })

		expect(result).toEqual({ success: true })
		expect(requestPasswordReset).toHaveBeenCalledWith(
			'admin@retrouveci.com',
			expect.any(Request),
		)
	})

	it.each(['', 'admin', 'admin@', '@retrouveci.com'])(
		'refuses %p on the email field, without calling the API',
		async email => {
			const result = await submit({ email })

			expect(errorsOf(result).email?.message).toBe('Email invalide')
			expect(requestPasswordReset).not.toHaveBeenCalled()
		},
	)

	// An unknown address must not tell the visitor whether the account exists,
	// so whatever the API says lands on `root`, never on the email field.
	it('reports an API refusal as a root error', async () => {
		requestPasswordReset.mockRejectedValue(new ApiError(404, 'Compte inconnu'))

		const result = await submit({ email: 'ghost@retrouveci.com' })

		expect(errorsOf(result).root?.message).toBe('Compte inconnu')
		expect(errorsOf(result).email).toBeUndefined()
	})

	it('lets a non-API failure through instead of reporting a form error', async () => {
		requestPasswordReset.mockRejectedValue(new Error('boom'))

		await expect(submit({ email: 'admin@retrouveci.com' })).rejects.toThrow(
			'boom',
		)
	})
})
