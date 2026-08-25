import type { ActionResult } from '@/shared/types/action'

/** `errors` lives on the failure branch of the union only. */
const errorsOf = (result: ActionResult) =>
	result.success ? undefined : result.errors

import { ApiError } from '@/shared/utils/api-fetch'

const { requireServerSession, sendOtp, setInitialPassword } = vi.hoisted(
	() => ({
		requireServerSession: vi.fn(),
		sendOtp: vi.fn(),
		setInitialPassword: vi.fn(),
	}),
)

vi.mock('@/shared/helpers/session.server', () => ({ requireServerSession }))
vi.mock('../register.service', () => ({ sendOtp, setInitialPassword }))

const { registerAction } = await import('../register.action')

function requestFor(fields: Record<string, string>) {
	const body = new FormData()
	for (const [key, value] of Object.entries(fields)) body.append(key, value)
	return new Request('http://localhost:3000/auth/register', {
		method: 'POST',
		body,
	})
}

beforeEach(() => {
	requireServerSession.mockReset().mockResolvedValue({ user: { id: 'u1' } })
	sendOtp.mockReset().mockResolvedValue(undefined)
	setInitialPassword.mockReset().mockResolvedValue(undefined)
})

afterEach(() => {
	vi.restoreAllMocks()
})

describe('registerAction', () => {
	describe('send-otp', () => {
		it('asks the API for a code', async () => {
			const result = await registerAction({
				request: requestFor({ intent: 'send-otp', phoneNumber: '0700000000' }),
			})

			expect(result).toEqual({ success: true })
			expect(sendOtp).toHaveBeenCalledWith('0700000000', expect.any(Request))
		})

		// Sending a code costs an SMS, so no session is required — but the step
		// must not be reachable without a number either.
		it('needs no session', async () => {
			await registerAction({
				request: requestFor({ intent: 'send-otp', phoneNumber: '0700000000' }),
			})

			expect(requireServerSession).not.toHaveBeenCalled()
		})

		it('refuses a missing number without spending an SMS', async () => {
			const result = await registerAction({
				request: requestFor({ intent: 'send-otp' }),
			})

			expect(result.success).toBe(false)
			expect(sendOtp).not.toHaveBeenCalled()
		})

		it('reports an API refusal as a root error', async () => {
			sendOtp.mockRejectedValue(new ApiError(429, 'Trop de tentatives'))

			const result = await registerAction({
				request: requestFor({ intent: 'send-otp', phoneNumber: '0700000000' }),
			})

			expect(result).toEqual({
				success: false,
				errors: { root: { type: 'custom', message: 'Trop de tentatives' } },
			})
		})
	})

	describe('set-initial-password', () => {
		// The phone is verified by now, so the session is what proves it.
		it('gates on the session before writing the password', async () => {
			const redirectResponse = new Response(null, { status: 302 })
			requireServerSession.mockRejectedValue(redirectResponse)

			await expect(
				registerAction({
					request: requestFor({
						intent: 'set-initial-password',
						newPassword: 'Motdepasse1',
					}),
				}),
			).rejects.toBe(redirectResponse)
			expect(setInitialPassword).not.toHaveBeenCalled()
		})

		it('sets a password the contract accepts', async () => {
			const result = await registerAction({
				request: requestFor({
					intent: 'set-initial-password',
					newPassword: 'Motdepasse1',
				}),
			})

			expect(result).toEqual({ success: true })
			expect(setInitialPassword).toHaveBeenCalledWith(
				'Motdepasse1',
				expect.any(Request),
			)
		})

		// The rule is the contract's: 8..128, an uppercase, a lowercase, a digit.
		it.each(['court1A', 'sansmajuscule1', 'SANSMINUSCULE1', 'SansChiffre'])(
			'refuses %s without calling the API',
			async newPassword => {
				const result = await registerAction({
					request: requestFor({ intent: 'set-initial-password', newPassword }),
				})

				expect(result.success).toBe(false)
				expect(errorsOf(result)?.newPassword).toBeDefined()
				expect(setInitialPassword).not.toHaveBeenCalled()
			},
		)
	})

	it.each(['', 'burn', 'send-OTP'])(
		'refuses the unknown intent %p',
		async intent => {
			const result = await registerAction({ request: requestFor({ intent }) })

			expect(result).toEqual({ success: false })
			expect(sendOtp).not.toHaveBeenCalled()
			expect(setInitialPassword).not.toHaveBeenCalled()
		},
	)
})
