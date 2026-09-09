import { ApiError } from '../api-fetch'
import {
	getApiErrorMessage,
	withApiOperationData,
	withApiOperationError,
} from '../api-operation'

const DEFAULT_MESSAGE = 'Une erreur est survenue. Veuillez réessayer.'

describe('withApiOperationError', () => {
	it('reports success when the operation resolves', async () => {
		expect(await withApiOperationError(async () => undefined)).toEqual({
			success: true,
		})
	})

	it('turns an ApiError into a root error carrying the API message', async () => {
		const result = await withApiOperationError(async () => {
			throw new ApiError(400, 'Le lien est invalide ou a expiré.')
		})

		expect(result).toEqual({
			success: false,
			errors: {
				root: {
					type: 'custom',
					message: 'Le lien est invalide ou a expiré.',
				},
			},
		})
	})

	it('falls back to a generic message when the ApiError carries none', async () => {
		const result = await withApiOperationError(async () => {
			throw new ApiError(500, '')
		})

		expect(result).toEqual({
			success: false,
			errors: { root: { type: 'custom', message: DEFAULT_MESSAGE } },
		})
	})

	it('redirects on 401 when a redirect target is given', async () => {
		const thrown = await withApiOperationError(
			async () => {
				throw new ApiError(401, 'Unauthorized')
			},
			{ redirectOnUnauthorized: '/login' },
		).catch((error: unknown) => error)

		expect(thrown).toBeInstanceOf(Response)
		const response = thrown as Response
		expect(response.status).toBe(302)
		expect(response.headers.get('Location')).toBe('/login')
	})

	it('reports a 401 as a form error when no redirect target is given', async () => {
		const result = await withApiOperationError(async () => {
			throw new ApiError(401, 'Session expirée.')
		})

		expect(result).toEqual({
			success: false,
			errors: { root: { type: 'custom', message: 'Session expirée.' } },
		})
	})

	it('does not redirect a 403, only a 401', async () => {
		const result = await withApiOperationError(
			async () => {
				throw new ApiError(403, 'Accès refusé.')
			},
			{ redirectOnUnauthorized: '/login' },
		)

		expect(result).toEqual({
			success: false,
			errors: { root: { type: 'custom', message: 'Accès refusé.' } },
		})
	})

	it('rethrows anything that is not an ApiError', async () => {
		await expect(
			withApiOperationError(async () => {
				throw new TypeError('fetch failed')
			}),
		).rejects.toThrow(TypeError)
	})
})

describe('withApiOperationData', () => {
	it('sends the resolved value back as data', async () => {
		const result = await withApiOperationData(async () => [{ code: 'RCI-1' }])

		expect(result).toEqual({ success: true, data: [{ code: 'RCI-1' }] })
	})

	it('drops nothing when the operation resolves undefined', async () => {
		expect(await withApiOperationData(async () => undefined)).toEqual({
			success: true,
			data: undefined,
		})
	})

	it('reports an ApiError on root, exactly as the discarding variant does', async () => {
		const failing = () => Promise.reject(new ApiError(409, 'Quota atteint.'))

		expect(await withApiOperationData(failing)).toEqual(
			await withApiOperationError(failing),
		)
	})

	it('redirects on 401 when a redirect target is given', async () => {
		const thrown = await withApiOperationData(
			async () => {
				throw new ApiError(401, 'Unauthorized')
			},
			{ redirectOnUnauthorized: '/login' },
		).catch((error: unknown) => error)

		expect(thrown).toBeInstanceOf(Response)
		expect((thrown as Response).headers.get('Location')).toBe('/login')
	})

	it('rethrows anything that is not an ApiError', async () => {
		await expect(
			withApiOperationData(async () => {
				throw new TypeError('fetch failed')
			}),
		).rejects.toThrow(TypeError)
	})
})

describe('getApiErrorMessage', () => {
	it('returns the error message when there is one', () => {
		expect(getApiErrorMessage(new ApiError(422, 'Numéro déjà utilisé.'))).toBe(
			'Numéro déjà utilisé.',
		)
	})

	it('returns the default message for an empty error message', () => {
		expect(getApiErrorMessage(new ApiError(500, ''))).toBe(DEFAULT_MESSAGE)
	})

	it('returns the given fallback instead of the default one', () => {
		expect(getApiErrorMessage(new ApiError(500, ''), 'Échec de l’envoi.')).toBe(
			'Échec de l’envoi.',
		)
	})
})

// The debt this closes: `ApiErrorBody` declared no `errors`, so the map a 400
// carries was read by nobody and every message reached a form as a banner.
describe('the API field errors', () => {
	const failing = (error: ApiError) => async () => {
		throw error
	}

	it('lands each message on the field it belongs to', async () => {
		const result = await withApiOperationError(
			failing(
				new ApiError(400, 'Validation failed', {
					email: ["L'adresse e-mail est invalide"],
					password: ['8 caractères minimum'],
				}),
			),
		)

		expect(result).toEqual({
			success: false,
			errors: {
				email: { type: 'server', message: "L'adresse e-mail est invalide" },
				password: { type: 'server', message: '8 caractères minimum' },
			},
		})
	})

	// « Validation failed » is what the pipe answers beside the map: it says
	// nothing a visitor can act on once the fields carry their own sentence.
	it('drops the envelope message once a field carries one', async () => {
		const result = await withApiOperationError(
			failing(new ApiError(400, 'Validation failed', { name: ['Requis'] })),
		)

		expect(result.success).toBe(false)
		expect(result.success === false && result.errors).not.toHaveProperty('root')
	})

	it('renames a field the form spells differently', async () => {
		const result = await withApiOperationError(
			failing(
				new ApiError(400, 'Validation failed', {
					deliveryAddress: ['Adresse requise'],
				}),
			),
			{ fields: { deliveryAddress: 'address' } },
		)

		expect(result).toEqual({
			success: false,
			errors: {
				address: { type: 'server', message: 'Adresse requise' },
			},
		})
	})

	// A name the form does not have would hold an error RHF renders nowhere.
	it('folds a field the form does not have into root', async () => {
		const result = await withApiOperationError(
			failing(
				new ApiError(400, 'Validation failed', {
					deliveryNotes: ['Note trop longue'],
				}),
			),
			{ fields: { deliveryAddress: 'address' } },
		)

		expect(result).toEqual({
			success: false,
			errors: { root: { type: 'custom', message: 'Note trop longue' } },
		})
	})

	it('joins the several messages one field can carry', async () => {
		const result = await withApiOperationError(
			failing(
				new ApiError(400, 'Validation failed', {
					password: ['8 caractères minimum', 'Une majuscule est requise'],
				}),
			),
		)

		expect(
			result.success === false && result.errors?.['password']?.message,
		).toBe('8 caractères minimum Une majuscule est requise')
	})

	it('keeps the root error when the API names no field at all', async () => {
		const result = await withApiOperationError(
			failing(new ApiError(409, 'Ce sticker est déjà activé')),
		)

		expect(result).toEqual({
			success: false,
			errors: {
				root: { type: 'custom', message: 'Ce sticker est déjà activé' },
			},
		})
	})
})
