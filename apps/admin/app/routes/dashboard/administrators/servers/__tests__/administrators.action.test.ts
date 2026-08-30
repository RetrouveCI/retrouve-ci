import type { ActionResult, FormErrors } from '@/shared/types/action'
import { ApiError } from '@/shared/utils/api-fetch'

const {
	requireAdminSession,
	appUrl,
	banAdminUser,
	createAdminUser,
	removeAdminUser,
	sendPasswordReset,
	setAdminRole,
	unbanAdminUser,
} = vi.hoisted(() => ({
	requireAdminSession: vi.fn(),
	appUrl: vi.fn(),
	banAdminUser: vi.fn(),
	createAdminUser: vi.fn(),
	removeAdminUser: vi.fn(),
	sendPasswordReset: vi.fn(),
	setAdminRole: vi.fn(),
	unbanAdminUser: vi.fn(),
}))

vi.mock('@/shared/helpers/session.server', () => ({ requireAdminSession }))
vi.mock('@/shared/helpers/redirect', () => ({ appUrl }))
vi.mock('../administrators.service', () => ({
	banAdminUser,
	createAdminUser,
	removeAdminUser,
	sendPasswordReset,
	setAdminRole,
	unbanAdminUser,
}))

const { administratorsAction } = await import('../administrators.action')

const VALID_CREATE = {
	name: 'Awa Traoré',
	email: 'awa@retrouveci.com',
	password: 'Azertyuiop1',
	role: 'admin',
}

const HEADERS = { cookie: 'session=abc', origin: 'http://localhost:3001' }

function submit(fields: Record<string, string>) {
	const body = new FormData()
	for (const [key, value] of Object.entries(fields)) body.append(key, value)

	return administratorsAction({
		request: new Request('http://localhost:3001/administrators', {
			method: 'POST',
			body,
			headers: { cookie: HEADERS.cookie, origin: HEADERS.origin },
		}),
	})
}

function errorsOf(result: ActionResult): FormErrors {
	if (result.success) throw new Error('expected the action to report an error')
	return result.errors ?? {}
}

beforeEach(() => {
	requireAdminSession.mockReset().mockResolvedValue(undefined)
	appUrl.mockReset().mockReturnValue('http://localhost:3001/reset-password')
	for (const fn of [
		banAdminUser,
		removeAdminUser,
		sendPasswordReset,
		setAdminRole,
		unbanAdminUser,
	]) {
		fn.mockReset().mockResolvedValue(undefined)
	}
	createAdminUser.mockReset().mockResolvedValue({ id: 'adm-1' })
})

afterEach(() => {
	vi.restoreAllMocks()
})

describe('administratorsAction', () => {
	// Every intent here creates, empowers or deletes an administrator, so the
	// gate must come before the body is even read.
	it('gates on the admin session before doing anything', async () => {
		requireAdminSession.mockRejectedValue(new Response(null, { status: 302 }))

		await expect(
			submit({ intent: 'delete', id: 'adm-1' }),
		).rejects.toBeInstanceOf(Response)
		expect(removeAdminUser).not.toHaveBeenCalled()
	})

	it('forwards the request cookie and origin to every call', async () => {
		await submit({ intent: 'delete', id: 'adm-1' })

		expect(removeAdminUser).toHaveBeenCalledWith(HEADERS, 'adm-1')
	})

	// The endpoints read the backoffice cookie, so a 401 is a dead session, not
	// a form error to render inside a dashboard the visitor can no longer see.
	it('redirects to login when the API answers 401', async () => {
		removeAdminUser.mockRejectedValue(new ApiError(401, 'Unauthorized'))

		await expect(
			submit({ intent: 'delete', id: 'adm-1' }),
		).rejects.toBeInstanceOf(Response)
	})

	describe('create', () => {
		it('sends the validated payload', async () => {
			const result = await submit({ intent: 'create', ...VALID_CREATE })

			expect(result).toEqual({ success: true })
			expect(createAdminUser).toHaveBeenCalledWith(HEADERS, {
				name: 'Awa Traoré',
				email: 'awa@retrouveci.com',
				password: 'Azertyuiop1',
				role: 'admin',
			})
		})

		// The API wants the key absent, not an empty string, since it shares the
		// column the public app sends OTPs to.
		it('omits a phone left blank rather than sending an empty string', async () => {
			await submit({ intent: 'create', ...VALID_CREATE, phone: '' })

			const [, payload] = createAdminUser.mock.calls[0]
			expect(payload).not.toHaveProperty('phone')
		})

		it('sends a phone that was typed', async () => {
			await submit({ intent: 'create', ...VALID_CREATE, phone: '0700000001' })

			const [, payload] = createAdminUser.mock.calls[0]
			expect(payload.phone).toBe('0700000001')
		})

		it('refuses a phone that is not an ivorian number', async () => {
			const result = await submit({
				intent: 'create',
				...VALID_CREATE,
				phone: '12345',
			})

			expect(errorsOf(result).phone?.message).toBeTruthy()
			expect(createAdminUser).not.toHaveBeenCalled()
		})

		it('refuses a password the shared rule rejects', async () => {
			const result = await submit({
				intent: 'create',
				...VALID_CREATE,
				password: 'azerty',
			})

			expect(errorsOf(result).password?.message).toBe('Au moins 8 caractères')
			expect(createAdminUser).not.toHaveBeenCalled()
		})

		it('reports a missing email in French', async () => {
			const result = await submit({
				intent: 'create',
				...VALID_CREATE,
				email: '',
			})

			expect(errorsOf(result).email?.message).toBe("L'email est requis")
			expect(createAdminUser).not.toHaveBeenCalled()
		})

		/** `super_admin` is not one of the two roles this screen hands out. */
		it('refuses a role the form has no business offering', async () => {
			const result = await submit({
				intent: 'create',
				...VALID_CREATE,
				role: 'super_admin',
			})

			expect(errorsOf(result).role?.message).toBe('Rôle invalide')
			expect(createAdminUser).not.toHaveBeenCalled()
		})
	})

	describe('update', () => {
		it('sets the role for the given id', async () => {
			expect(
				await submit({ intent: 'update', id: 'adm-1', role: 'moderator' }),
			).toEqual({ success: true })
			expect(setAdminRole).toHaveBeenCalledWith(HEADERS, 'adm-1', 'moderator')
		})

		// Validation runs before the id check, so a bad role is reported as a
		// field error even when the id is also missing.
		it('refuses an unknown role in French', async () => {
			const result = await submit({
				intent: 'update',
				id: 'adm-1',
				role: 'god',
			})

			expect(errorsOf(result).role?.message).toBe('Rôle invalide')
			expect(setAdminRole).not.toHaveBeenCalled()
		})

		it('refuses an update with no id', async () => {
			const result = await submit({ intent: 'update', role: 'moderator' })

			expect(errorsOf(result).root?.message).toBe(
				"L'administrateur à modifier est introuvable",
			)
			expect(setAdminRole).not.toHaveBeenCalled()
		})
	})

	describe('toggle-status', () => {
		it('bans when the posted status is inactive', async () => {
			expect(
				await submit({
					intent: 'toggle-status',
					id: 'adm-1',
					status: 'inactive',
				}),
			).toEqual({ success: true })
			expect(banAdminUser).toHaveBeenCalledWith(HEADERS, 'adm-1')
			expect(unbanAdminUser).not.toHaveBeenCalled()
		})

		// Anything that is not the literal `inactive` unbans, including a missing
		// field — the safer default of the two.
		it.each(['active', ''])('unbans on status %p', async status => {
			await submit({ intent: 'toggle-status', id: 'adm-1', status })

			expect(unbanAdminUser).toHaveBeenCalledWith(HEADERS, 'adm-1')
			expect(banAdminUser).not.toHaveBeenCalled()
		})

		it('refuses a toggle with no id', async () => {
			const result = await submit({
				intent: 'toggle-status',
				status: 'inactive',
			})

			expect(errorsOf(result).root?.message).toBe(
				"L'administrateur à mettre à jour est introuvable",
			)
			expect(banAdminUser).not.toHaveBeenCalled()
		})
	})

	describe('delete', () => {
		// Irreversible, so an id is not optional.
		it('refuses a delete with no id', async () => {
			const result = await submit({ intent: 'delete' })

			expect(errorsOf(result).root?.message).toBe(
				"L'administrateur à supprimer est introuvable",
			)
			expect(removeAdminUser).not.toHaveBeenCalled()
		})
	})

	describe('reset-password', () => {
		/**
		 * The link is emailed by the API and resolved against `BETTER_AUTH_URL`
		 * unless it is absolute, so `appUrl` is what makes it land on the
		 * backoffice.
		 */
		it('sends an absolute redirect built by appUrl', async () => {
			const result = await submit({
				intent: 'reset-password',
				email: 'awa@retrouveci.com',
			})

			expect(result).toEqual({ success: true })
			expect(appUrl).toHaveBeenCalledWith(
				'/reset-password',
				expect.any(Request),
			)
			expect(sendPasswordReset).toHaveBeenCalledWith(
				HEADERS,
				'awa@retrouveci.com',
				'http://localhost:3001/reset-password',
			)
		})

		it('refuses a reset with no email', async () => {
			const result = await submit({ intent: 'reset-password' })

			expect(errorsOf(result).root?.message).toBe(
				"L'administrateur à réinitialiser est introuvable",
			)
			expect(sendPasswordReset).not.toHaveBeenCalled()
		})
	})

	it('refuses an unknown intent', async () => {
		expect(errorsOf(await submit({ intent: 'promouvoir' })).root?.message).toBe(
			'Action inconnue',
		)
	})

	it('refuses a submission with no intent at all', async () => {
		expect(errorsOf(await submit({})).root?.message).toBe('Action inconnue')
	})
})
