import { ApiError } from '@/shared/utils/api-fetch'

const {
	getServerSession,
	updateProfile,
	sendPhoneChangeOtp,
	deleteAccount,
	subscribeToPush,
	unsubscribeFromPush,
} = vi.hoisted(() => ({
	getServerSession: vi.fn(),
	updateProfile: vi.fn(),
	sendPhoneChangeOtp: vi.fn(),
	deleteAccount: vi.fn(),
	subscribeToPush: vi.fn(),
	unsubscribeFromPush: vi.fn(),
}))

vi.mock('@/shared/helpers/session.server', () => ({ getServerSession }))
vi.mock('../settings.service', () => ({
	updateProfile,
	sendPhoneChangeOtp,
	deleteAccount,
	subscribeToPush,
	unsubscribeFromPush,
}))

const { settingsAction } = await import('../settings.action')

function requestFor(fields: Record<string, string>) {
	const body = new FormData()
	for (const [key, value] of Object.entries(fields)) body.append(key, value)
	return new Request('http://localhost:3000/account/settings', {
		method: 'POST',
		body,
	})
}

const isRedirectTo = (value: unknown, location: string) =>
	value instanceof Response &&
	value.status >= 300 &&
	value.status < 400 &&
	value.headers.get('location') === location

beforeEach(() => {
	getServerSession.mockReset().mockResolvedValue({ user: { id: 'u1' } })
	updateProfile.mockReset().mockResolvedValue(undefined)
	sendPhoneChangeOtp.mockReset().mockResolvedValue(undefined)
	deleteAccount.mockReset().mockResolvedValue(undefined)
	subscribeToPush.mockReset().mockResolvedValue(undefined)
	unsubscribeFromPush.mockReset().mockResolvedValue(undefined)
})

afterEach(() => {
	vi.restoreAllMocks()
})

describe('settingsAction', () => {
	it('sends an anonymous visitor to the login page, touching nothing', async () => {
		getServerSession.mockResolvedValue(null)

		const thrown = await settingsAction({
			request: requestFor({ intent: 'update-name', name: 'Awa' }),
		}).catch((error: unknown) => error)

		expect(isRedirectTo(thrown, '/login')).toBe(true)
		expect(updateProfile).not.toHaveBeenCalled()
	})

	describe('update-name', () => {
		it('saves the new name', async () => {
			const result = await settingsAction({
				request: requestFor({ intent: 'update-name', name: 'Awa Traoré' }),
			})

			expect(result).toEqual({ success: true })
			expect(updateProfile).toHaveBeenCalledWith(expect.any(Request), {
				name: 'Awa Traoré',
			})
		})

		it.each(['', 'A'])('refuses the name %p', async name => {
			const result = await settingsAction({
				request: requestFor({ intent: 'update-name', name }),
			})

			expect(result.success).toBe(false)
			expect(updateProfile).not.toHaveBeenCalled()
		})
	})

	describe('update-zone', () => {
		it('saves the city and the commune', async () => {
			await settingsAction({
				request: requestFor({
					intent: 'update-zone',
					city: 'Abidjan',
					commune: 'Cocody',
				}),
			})

			expect(updateProfile).toHaveBeenCalledWith(expect.any(Request), {
				city: 'Abidjan',
				commune: 'Cocody',
			})
		})

		// The commune is optional, and an absent one must clear the stored value
		// rather than reach the API as `undefined`.
		it('clears the commune when none is chosen', async () => {
			await settingsAction({
				request: requestFor({ intent: 'update-zone', city: 'Abidjan' }),
			})

			expect(updateProfile).toHaveBeenCalledWith(expect.any(Request), {
				city: 'Abidjan',
				commune: '',
			})
		})

		it('refuses a missing city', async () => {
			const result = await settingsAction({
				request: requestFor({ intent: 'update-zone', city: '' }),
			})

			expect(result.success).toBe(false)
			expect(updateProfile).not.toHaveBeenCalled()
		})
	})

	describe('send-phone-otp', () => {
		it('asks for a code on a valid number', async () => {
			await settingsAction({
				request: requestFor({ intent: 'send-phone-otp', phone: '0700000000' }),
			})

			expect(sendPhoneChangeOtp).toHaveBeenCalledWith(
				expect.any(Request),
				'0700000000',
			)
		})

		it.each(['', '123', '0700000000000000'])(
			'refuses %p without spending an SMS',
			async phone => {
				const result = await settingsAction({
					request: requestFor({ intent: 'send-phone-otp', phone }),
				})

				expect(result.success).toBe(false)
				expect(sendPhoneChangeOtp).not.toHaveBeenCalled()
			},
		)
	})

	describe('delete-account', () => {
		it('deletes only against the current password', async () => {
			const result = await settingsAction({
				request: requestFor({
					intent: 'delete-account',
					password: 'peu-importe',
				}),
			})

			expect(result).toEqual({ success: true })
			expect(deleteAccount).toHaveBeenCalledWith(
				'peu-importe',
				expect.any(Request),
			)
		})

		// Deletion is irreversible: an empty field must never reach the API.
		it('refuses an empty password', async () => {
			const result = await settingsAction({
				request: requestFor({ intent: 'delete-account', password: '' }),
			})

			expect(result.success).toBe(false)
			expect(deleteAccount).not.toHaveBeenCalled()
		})

		it('reports a wrong password as a root error', async () => {
			deleteAccount.mockRejectedValue(
				new ApiError(400, 'Mot de passe incorrect'),
			)

			const result = await settingsAction({
				request: requestFor({ intent: 'delete-account', password: 'faux' }),
			})

			expect(result).toEqual({
				success: false,
				errors: {
					root: { type: 'custom', message: 'Mot de passe incorrect' },
				},
			})
		})
	})

	it.each(['', 'burn', 'update-email'])(
		'refuses the unknown intent %p',
		async intent => {
			const result = await settingsAction({ request: requestFor({ intent }) })

			expect(result.success).toBe(false)
			expect(updateProfile).not.toHaveBeenCalled()
			expect(deleteAccount).not.toHaveBeenCalled()
		},
	)

	// A session that expired between the page load and the submit must send the
	// visitor to the login page, not report a form error.
	it('redirects when the API answers 401', async () => {
		updateProfile.mockRejectedValue(new ApiError(401, 'Non autorisé'))

		const thrown = await settingsAction({
			request: requestFor({ intent: 'update-name', name: 'Awa' }),
		}).catch((error: unknown) => error)

		expect(isRedirectTo(thrown, '/login')).toBe(true)
	})

	describe('push on this device', () => {
		const REGISTRATION = {
			endpoint: 'https://fcm.googleapis.com/fcm/send/abc',
			p256dh: 'a'.repeat(88),
			auth: 'b'.repeat(24),
		}

		it('hands the flat fields to the service', async () => {
			const result = await settingsAction({
				request: requestFor({ intent: 'subscribe-push', ...REGISTRATION }),
			})

			expect(result).toEqual({ success: true })
			expect(subscribeToPush).toHaveBeenCalledWith(
				expect.any(Request),
				expect.objectContaining(REGISTRATION),
			)
		})

		it('unsubscribes by endpoint', async () => {
			await settingsAction({
				request: requestFor({
					intent: 'unsubscribe-push',
					endpoint: REGISTRATION.endpoint,
				}),
			})

			expect(unsubscribeFromPush).toHaveBeenCalledWith(
				expect.any(Request),
				REGISTRATION.endpoint,
			)
		})

		// The API bounds the shape; the front only refuses an empty field, so a
		// blank endpoint never reaches a round trip.
		it('refuses an empty endpoint without calling the API', async () => {
			const result = await settingsAction({
				request: requestFor({ intent: 'unsubscribe-push', endpoint: '' }),
			})

			expect(result).toMatchObject({ success: false })
			expect(unsubscribeFromPush).not.toHaveBeenCalled()
		})

		it('turns an API refusal into a root error', async () => {
			subscribeToPush.mockRejectedValue(new ApiError(400, 'Validation failed'))

			const result = await settingsAction({
				request: requestFor({ intent: 'subscribe-push', ...REGISTRATION }),
			})

			expect(result).toMatchObject({ success: false })
		})
	})
})
