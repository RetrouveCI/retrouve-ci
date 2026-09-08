import { Field, FieldError } from '@app/ui/components'
import { page, render } from '@/shared/helpers/testing'

// `packages/ui` has no runner, so its guards live here. `FieldError` had drifted
// from the shadcn revision, and one point was an alert with nothing in it.
function renderErrors(errors: Array<{ message?: string }> | undefined) {
	render(
		<Field>
			<FieldError errors={errors} />
			<span data-testid="settled" />
		</Field>,
	)
}

// ⚠️ Counted, never `not.toBeInTheDocument()`: a locator matching several
// elements resolves to none, so the negative form passes on two as on zero.
const count = (role: 'alert' | 'listitem') =>
	page.getByRole(role).elements().length

async function settle() {
	await expect.element(page.getByTestId('settled')).toBeInTheDocument()
}

describe('FieldError', () => {
	it.each([[[]], [undefined]])(
		'renders no alert at all for %j',
		async errors => {
			renderErrors(errors)
			await settle()

			expect(count('alert')).toBe(0)
		},
	)

	it('states a single message as text, not as a list', async () => {
		renderErrors([{ message: 'Le nom est requis' }])
		await settle()

		await expect
			.element(page.getByRole('alert'))
			.toHaveTextContent('Le nom est requis')
		expect(count('listitem')).toBe(0)
	})

	it('says a repeated message once', async () => {
		renderErrors([
			{ message: 'Le nom est requis' },
			{ message: 'Le nom est requis' },
		])
		await settle()

		expect(count('alert')).toBe(1)
		expect(count('listitem')).toBe(0)
		await expect
			.element(page.getByRole('alert'))
			.toHaveTextContent('Le nom est requis')
	})

	it('lists two distinct messages', async () => {
		renderErrors([{ message: 'Trop court' }, { message: 'Chiffre manquant' }])
		await settle()

		expect(count('listitem')).toBe(2)
	})
})
