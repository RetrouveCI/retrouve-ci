import { createRoutesStub } from 'react-router'
import { page, render, userEvent } from '@/shared/helpers/testing'
import type { ActionResult } from '@/shared/types/action'
import { ResetPasswordForm } from '../reset-password-form'

function renderForm(action: (args: { request: Request }) => unknown) {
	const Stub = createRoutesStub([
		{
			path: '/reset-password',
			Component: () => <ResetPasswordForm token="valid-token" />,
			action,
		},
	])

	render(<Stub initialEntries={['/reset-password']} />)
}

// `exact` matters: each eye toggle is labelled after its field, so a loose
// match would resolve to both the input and the button.
const newPassword = () =>
	page.getByLabelText('Nouveau mot de passe', { exact: true })
const confirmPassword = () =>
	page.getByLabelText('Confirmer le mot de passe', { exact: true })
const submit = () =>
	userEvent.click(
		page.getByRole('button', { name: 'Réinitialiser le mot de passe' }),
	)

describe('ResetPasswordForm', () => {
	it('renders both password fields and the strength hint', async () => {
		renderForm(() => ({ success: true }) as ActionResult)

		await expect.element(newPassword()).toBeInTheDocument()
		await expect.element(confirmPassword()).toBeInTheDocument()
		await expect
			.element(
				page.getByText(
					'Min. 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre',
				),
			)
			.toBeInTheDocument()
	})

	it('reports a password that fails the strength rules', async () => {
		const action = vi.fn(() => ({ success: true }) as ActionResult)
		renderForm(action)

		await userEvent.fill(newPassword(), 'court')
		await userEvent.fill(confirmPassword(), 'court')
		await submit()

		await expect
			.element(page.getByText('Au moins 8 caractères'))
			.toBeInTheDocument()
		expect(action).not.toHaveBeenCalled()
	})

	it('reports a mismatch on the confirmation field', async () => {
		renderForm(() => ({ success: true }) as ActionResult)

		await userEvent.fill(newPassword(), 'MotDePasse1')
		await userEvent.fill(confirmPassword(), 'MotDePasse2')
		await submit()

		await expect
			.element(page.getByText('Les mots de passe ne correspondent pas'))
			.toBeInTheDocument()
	})

	it('sends the token along with the new password', async () => {
		const received: Record<string, string> = {}
		renderForm(async ({ request }) => {
			for (const [key, value] of await request.formData()) {
				received[key] = String(value)
			}
			return { success: true } as ActionResult
		})

		await userEvent.fill(newPassword(), 'MotDePasse1')
		await userEvent.fill(confirmPassword(), 'MotDePasse1')
		await submit()

		await expect
			.element(page.getByText('Mot de passe réinitialisé'))
			.toBeInTheDocument()
		expect(received.token).toBe('valid-token')
		expect(received.newPassword).toBe('MotDePasse1')
	})

	it('replaces the form with a confirmation once the action succeeds', async () => {
		renderForm(() => ({ success: true }) as ActionResult)

		await userEvent.fill(newPassword(), 'MotDePasse1')
		await userEvent.fill(confirmPassword(), 'MotDePasse1')
		await submit()

		await expect
			.element(page.getByText('Mot de passe réinitialisé'))
			.toBeInTheDocument()
		await expect
			.element(
				page.getByRole('button', { name: 'Réinitialiser le mot de passe' }),
			)
			.not.toBeInTheDocument()
	})

	it('renders the real API message rather than a hard-coded one', async () => {
		renderForm(
			() =>
				({
					success: false,
					errors: {
						root: { type: 'custom', message: 'Le jeton a déjà été utilisé' },
					},
				}) as ActionResult,
		)

		await userEvent.fill(newPassword(), 'MotDePasse1')
		await userEvent.fill(confirmPassword(), 'MotDePasse1')
		await submit()

		await expect
			.element(page.getByText('Impossible de réinitialiser le mot de passe'))
			.toBeInTheDocument()
		await expect
			.element(page.getByText('Le jeton a déjà été utilisé'))
			.toBeInTheDocument()
	})

	it('toggles the visibility of a password field', async () => {
		renderForm(() => ({ success: true }) as ActionResult)

		await expect.element(newPassword()).toHaveAttribute('type', 'password')

		await userEvent.click(
			page.getByRole('button', {
				name: 'Afficher le champ Nouveau mot de passe',
			}),
		)

		await expect.element(newPassword()).toHaveAttribute('type', 'text')
		await expect.element(confirmPassword()).toHaveAttribute('type', 'password')
	})
})
