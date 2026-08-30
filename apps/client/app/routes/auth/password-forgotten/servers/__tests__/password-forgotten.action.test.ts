import type { ActionResult } from '@/shared/types/action'
import { ApiError } from '@/shared/utils/api-fetch'

/** `errors` lives on the failure branch of the union only. */
const errorsOf = (result: ActionResult) =>
	result.success ? undefined : result.errors

const { requestPasswordReset } = vi.hoisted(() => ({
	requestPasswordReset: vi.fn(),
}))

vi.mock('../password-forgotten.service', () => ({ requestPasswordReset }))

const { passwordForgottenAction } = await import('../password-forgotten.action')

function requestFor(fields: Record<string, string>) {
	const body = new FormData()
	for (const [key, value] of Object.entries(fields)) body.append(key, value)
	return new Request('http://localhost:3000/password-forgotten', {
		method: 'POST',
		body,
	})
}

beforeEach(() => {
	requestPasswordReset.mockReset().mockResolvedValue(undefined)
})

afterEach(() => {
	vi.restoreAllMocks()
})

describe('passwordForgottenAction', () => {
	it('sends the reset code to a valid ivorian number', async () => {
		const result = await passwordForgottenAction({
			request: requestFor({ phoneNumber: '0700000000' }),
		})

		expect(result).toEqual({ success: true })
		expect(requestPasswordReset).toHaveBeenCalledWith(
			'0700000000',
			expect.any(Request),
		)
	})

	it('trims the number before sending it', async () => {
		await passwordForgottenAction({
			request: requestFor({ phoneNumber: '  0700000000  ' }),
		})

		expect(requestPasswordReset).toHaveBeenCalledWith(
			'0700000000',
			expect.any(Request),
		)
	})

	it.each(['', '123', 'pas-un-numero', '0700000000000000'])(
		'refuses %p on the field, without calling the API',
		async phoneNumber => {
			const result = await passwordForgottenAction({
				request: requestFor({ phoneNumber }),
			})

			expect(errorsOf(result)).toMatchObject({ phoneNumber: expect.anything() })
			expect(requestPasswordReset).not.toHaveBeenCalled()
		},
	)

	// An unknown number must not tell the visitor whether an account exists;
	// whatever the API says lands on `root`, never on the phone field.
	it('reports an API refusal as a root error', async () => {
		requestPasswordReset.mockRejectedValue(
			new ApiError(404, 'Numéro introuvable'),
		)

		const result = await passwordForgottenAction({
			request: requestFor({ phoneNumber: '0700000000' }),
		})

		expect(result).toEqual({
			success: false,
			errors: { root: { type: 'custom', message: 'Numéro introuvable' } },
		})
	})

	it('lets a non-API failure through instead of reporting a form error', async () => {
		requestPasswordReset.mockRejectedValue(new Error('boom'))

		await expect(
			passwordForgottenAction({
				request: requestFor({ phoneNumber: '0700000000' }),
			}),
		).rejects.toThrow('boom')
	})
})
