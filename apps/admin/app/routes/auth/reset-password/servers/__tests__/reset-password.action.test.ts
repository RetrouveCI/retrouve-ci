import type { ActionResult, FormErrors } from '@/shared/types/action'
import { ApiError } from '@/shared/utils/api-fetch'

const { resetPassword } = vi.hoisted(() => ({ resetPassword: vi.fn() }))

vi.mock('../reset-password.service', () => ({ resetPassword }))

const { resetPasswordAction } = await import('../reset-password.action')

const VALID = {
	token: 'reset-token-1',
	newPassword: 'Azertyuiop1',
	confirmPassword: 'Azertyuiop1',
}

function submit(fields: Record<string, string>) {
	const body = new FormData()
	for (const [key, value] of Object.entries(fields)) body.append(key, value)

	return resetPasswordAction({
		request: new Request('http://localhost:3001/reset-password', {
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
	resetPassword.mockReset().mockResolvedValue(undefined)
})

afterEach(() => {
	vi.restoreAllMocks()
})

describe('resetPasswordAction', () => {
	it('sends the new password with its token, and not the confirmation', async () => {
		const result = await submit(VALID)

		expect(result).toEqual({ success: true })
		expect(resetPassword).toHaveBeenCalledWith(
			'Azertyuiop1',
			'reset-token-1',
			expect.any(Request),
		)
	})

	it('refuses a password the shared rule rejects', async () => {
		const result = await submit({
			...VALID,
			newPassword: 'azerty',
			confirmPassword: 'azerty',
		})

		expect(errorsOf(result).newPassword?.message).toBe('Au moins 8 caractères')
		expect(resetPassword).not.toHaveBeenCalled()
	})

	it('reports a mismatch on the confirmation field', async () => {
		const result = await submit({ ...VALID, confirmPassword: 'Azertyuiop2' })

		expect(errorsOf(result).confirmPassword?.message).toBe(
			'Les mots de passe ne correspondent pas',
		)
		expect(resetPassword).not.toHaveBeenCalled()
	})

	/**
	 * The token is a hidden field, so an error on it belongs to no input the
	 * visitor could correct. It must surface on `root`, which the form renders.
	 */
	it('moves a token error to root, leaving no token key behind', async () => {
		const result = await submit({ ...VALID, token: '' })

		expect(errorsOf(result).root?.message).toBe(
			'Lien de réinitialisation invalide ou expiré',
		)
		expect(errorsOf(result)).not.toHaveProperty('token')
		expect(resetPassword).not.toHaveBeenCalled()
	})

	// Moving the token error must not drop the other fields' own messages.
	it('keeps the other field errors when the token error moves', async () => {
		const result = await submit({
			token: '',
			newPassword: 'Azertyuiop1',
			confirmPassword: 'Azertyuiop2',
		})

		expect(errorsOf(result).root?.message).toBe(
			'Lien de réinitialisation invalide ou expiré',
		)
		expect(errorsOf(result).confirmPassword?.message).toBe(
			'Les mots de passe ne correspondent pas',
		)
		expect(errorsOf(result)).not.toHaveProperty('token')
	})

	it('reports an expired token from the API as a root error', async () => {
		resetPassword.mockRejectedValue(new ApiError(400, 'Lien expiré'))

		expect(errorsOf(await submit(VALID)).root?.message).toBe('Lien expiré')
	})

	it('lets a non-API failure through', async () => {
		resetPassword.mockRejectedValue(new Error('boom'))

		await expect(submit(VALID)).rejects.toThrow('boom')
	})
})
