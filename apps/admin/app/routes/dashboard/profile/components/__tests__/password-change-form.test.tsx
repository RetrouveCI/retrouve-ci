import { page, render, userEvent } from '@/shared/helpers/testing'
import { PasswordChangeForm } from '../password-change-form'

const { changePassword, success } = vi.hoisted(() => ({
	changePassword: vi.fn(),
	success: vi.fn(),
}))

vi.mock('../../helpers/profile.client', () => ({ changePassword }))
// The `@app/ui/components` barrel pulls sonner's `Toaster` in, so the real
// module has to stay around — only `toast` is swapped.
vi.mock('sonner', async importOriginal => ({
	...(await importOriginal<typeof import('sonner')>()),
	toast: { success },
}))

// `exact` matters: each eye toggle is labelled after its field, so a loose
// match would resolve to both the input and the button.
const currentPassword = () =>
	page.getByLabelText('Mot de passe actuel', { exact: true })
const newPassword = () =>
	page.getByLabelText('Nouveau mot de passe', { exact: true })
const confirmPassword = () =>
	page.getByLabelText('Confirmer le mot de passe', { exact: true })
const submit = () =>
	page.getByRole('button', { name: 'Mettre à jour le mot de passe' })

async function fillPasswords(newValue = 'Nouveau123', confirm = newValue) {
	await userEvent.fill(currentPassword(), 'ancien-mot-de-passe')
	await userEvent.fill(newPassword(), newValue)
	await userEvent.fill(confirmPassword(), confirm)
}

beforeEach(() => {
	changePassword.mockReset()
	success.mockReset()
	changePassword.mockResolvedValue({ success: true })
})

describe('PasswordChangeForm', () => {
	it('renders the three fields and the submit button', async () => {
		render(<PasswordChangeForm />)

		await expect.element(currentPassword()).toBeInTheDocument()
		await expect.element(newPassword()).toBeInTheDocument()
		await expect.element(confirmPassword()).toBeInTheDocument()
		await expect.element(submit()).toBeInTheDocument()
	})

	it('reports the schema messages on an empty submit without calling the API', async () => {
		render(<PasswordChangeForm />)

		await userEvent.click(submit())

		await expect
			.element(page.getByText('Mot de passe actuel requis'))
			.toBeInTheDocument()
		await expect
			.element(page.getByText('Au moins 8 caractères'))
			.toBeInTheDocument()
		await expect
			.element(page.getByText('Confirmation requise'))
			.toBeInTheDocument()
		expect(changePassword).not.toHaveBeenCalled()
	})

	it('reports a mismatched confirmation without calling the API', async () => {
		render(<PasswordChangeForm />)

		await fillPasswords('Nouveau123', 'Different123')
		await userEvent.click(submit())

		await expect
			.element(page.getByText('Les mots de passe ne correspondent pas'))
			.toBeInTheDocument()
		expect(changePassword).not.toHaveBeenCalled()
	})

	it('sends the current and the new password once the schema passes', async () => {
		render(<PasswordChangeForm />)

		await fillPasswords()
		await userEvent.click(submit())

		await vi.waitFor(() =>
			expect(changePassword).toHaveBeenCalledWith(
				'ancien-mot-de-passe',
				'Nouveau123',
			),
		)
	})

	it('lands a wrong current password under that field, not in a toast', async () => {
		changePassword.mockResolvedValue({
			success: false,
			error: 'Mot de passe incorrect',
			field: 'currentPassword',
		})
		render(<PasswordChangeForm />)

		await fillPasswords()
		await userEvent.click(submit())

		await expect
			.element(page.getByText('Mot de passe incorrect'))
			.toBeInTheDocument()
		expect(success).not.toHaveBeenCalled()
		await expect.element(currentPassword()).toHaveValue('ancien-mot-de-passe')
	})

	it('renders a failure that belongs to no field as a root error', async () => {
		changePassword.mockResolvedValue({
			success: false,
			error: 'Ce compte ne dispose pas de connexion par mot de passe',
		})
		render(<PasswordChangeForm />)

		await fillPasswords()
		await userEvent.click(submit())

		await expect
			.element(page.getByText('Impossible de changer le mot de passe'))
			.toBeInTheDocument()
		await expect
			.element(
				page.getByText(
					'Ce compte ne dispose pas de connexion par mot de passe',
				),
			)
			.toBeInTheDocument()
	})

	it('toasts and empties the three fields on success', async () => {
		render(<PasswordChangeForm />)

		await fillPasswords()
		await userEvent.click(submit())

		await vi.waitFor(() =>
			expect(success).toHaveBeenCalledWith(
				'Mot de passe mis à jour avec succès',
			),
		)
		await expect.element(currentPassword()).toHaveValue('')
		await expect.element(newPassword()).toHaveValue('')
		await expect.element(confirmPassword()).toHaveValue('')
	})

	it('toggles the visibility of each field on its own', async () => {
		render(<PasswordChangeForm />)

		await userEvent.click(
			page.getByRole('button', {
				name: 'Afficher le champ Nouveau mot de passe',
			}),
		)

		await expect.element(newPassword()).toHaveAttribute('type', 'text')
		await expect.element(currentPassword()).toHaveAttribute('type', 'password')
		await expect.element(confirmPassword()).toHaveAttribute('type', 'password')

		await userEvent.click(
			page.getByRole('button', {
				name: 'Masquer le champ Nouveau mot de passe',
			}),
		)

		await expect.element(newPassword()).toHaveAttribute('type', 'password')
	})
})
