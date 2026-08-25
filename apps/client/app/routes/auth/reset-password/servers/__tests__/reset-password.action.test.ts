import type { ActionResult } from '@/shared/types/action'

/** `errors` lives on the failure branch of the union only. */
const errorsOf = (result: ActionResult) =>
	result.success ? undefined : result.errors

import { OTP_LENGTH } from '@app/contracts/shared'
import { ApiError } from '@/shared/utils/api-fetch'

const { requestPasswordResetOtp, resetPassword } = vi.hoisted(() => ({
	requestPasswordResetOtp: vi.fn(),
	resetPassword: vi.fn(),
}))

vi.mock('../reset-password.service', () => ({
	requestPasswordResetOtp,
	resetPassword,
}))

const { resetPasswordAction } = await import('../reset-password.action')

function requestFor(fields: Record<string, string>) {
	const body = new FormData()
	for (const [key, value] of Object.entries(fields)) body.append(key, value)
	return new Request('http://localhost:3000/auth/reset-password', {
		method: 'POST',
		body,
	})
}

const VALID_OTP = '1'.repeat(OTP_LENGTH)

const validReset = {
	intent: 'reset-password',
	phoneNumber: '0700000000',
	otp: VALID_OTP,
	newPassword: 'Motdepasse1',
}

beforeEach(() => {
	requestPasswordResetOtp.mockReset().mockResolvedValue(undefined)
	resetPassword.mockReset().mockResolvedValue(undefined)
})

afterEach(() => {
	vi.restoreAllMocks()
})

describe('resetPasswordAction', () => {
	describe('resend-otp', () => {
		it('asks the API for another code', async () => {
			const result = await resetPasswordAction({
				request: requestFor({
					intent: 'resend-otp',
					phoneNumber: '0700000000',
				}),
			})

			expect(result).toEqual({ success: true })
			expect(requestPasswordResetOtp).toHaveBeenCalledWith(
				'0700000000',
				expect.any(Request),
			)
		})

		it('refuses a missing number without spending an SMS', async () => {
			const result = await resetPasswordAction({
				request: requestFor({ intent: 'resend-otp' }),
			})

			expect(result.success).toBe(false)
			expect(requestPasswordResetOtp).not.toHaveBeenCalled()
		})
	})

	describe('reset-password', () => {
		it('sends the whole submission to the API', async () => {
			const result = await resetPasswordAction({
				request: requestFor(validReset),
			})

			expect(result).toEqual({ success: true })
			expect(resetPassword).toHaveBeenCalledWith(
				{
					intent: 'reset-password',
					phoneNumber: '0700000000',
					otp: VALID_OTP,
					newPassword: 'Motdepasse1',
				},
				expect.any(Request),
			)
		})

		// The plugin issues a six-digit code, so a four-digit one could only ever
		// be refused by the API.
		it.each(['1234', '1'.repeat(OTP_LENGTH + 1), 'abcdef', ''])(
			'refuses the code %p without calling the API',
			async otp => {
				const result = await resetPasswordAction({
					request: requestFor({ ...validReset, otp }),
				})

				expect(result.success).toBe(false)
				expect(errorsOf(result)?.otp).toBeDefined()
				expect(resetPassword).not.toHaveBeenCalled()
			},
		)

		it.each(['court1A', 'sansmajuscule1', 'SANSCHIFFRE'])(
			'refuses the password %s without calling the API',
			async newPassword => {
				const result = await resetPasswordAction({
					request: requestFor({ ...validReset, newPassword }),
				})

				expect(result.success).toBe(false)
				expect(errorsOf(result)?.newPassword).toBeDefined()
				expect(resetPassword).not.toHaveBeenCalled()
			},
		)

		// An expired code is the common case, and it belongs on the form, not on a
		// crashed route.
		it('reports an expired code as a root error', async () => {
			resetPassword.mockRejectedValue(new ApiError(400, 'Code expiré'))

			const result = await resetPasswordAction({
				request: requestFor(validReset),
			})

			expect(result).toEqual({
				success: false,
				errors: { root: { type: 'custom', message: 'Code expiré' } },
			})
		})
	})

	it.each(['', 'burn', 'reset'])(
		'refuses the unknown intent %p',
		async intent => {
			const result = await resetPasswordAction({
				request: requestFor({ ...validReset, intent }),
			})

			expect(result).toEqual({ success: false })
			expect(resetPassword).not.toHaveBeenCalled()
			expect(requestPasswordResetOtp).not.toHaveBeenCalled()
		},
	)
})
