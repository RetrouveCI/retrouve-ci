import { createRoutesStub, useSearchParams } from 'react-router'
import { page, render, userEvent } from '@/shared/helpers/testing'
import type { ActionResult } from '@/shared/types/action'
import ResetPasswordPage from '../_index'

const { success, error } = vi.hoisted(() => ({
	success: vi.fn(),
	error: vi.fn(),
}))

// The `@app/ui/components` barrel pulls sonner's `Toaster` in, so the real
// module has to stay around — only `toast` is swapped.
vi.mock('sonner', async importOriginal => ({
	...(await importOriginal<typeof import('sonner')>()),
	toast: { success, error },
}))

const PHONE = '0700000000'
const CODE = '123456'
const PASSWORD = 'Motdepasse1'

type Action = (args: { request: Request }) => unknown

/** Echoes the query it was reached with, so a test can read where it landed. */
function ParamsProbe({ label }: { label: string }) {
	const [searchParams] = useSearchParams()
	return (
		<p>
			{label} {searchParams.get('phone') ?? '-'}{' '}
			{searchParams.get('redirectTo') ?? '-'}
		</p>
	)
}

/**
 * `async` on purpose: a route action always crosses the network, so the fetcher
 * really does render its `submitting` state. A synchronous stub would settle
 * inside the batch that submits it, which no deployed action ever does.
 */
function renderPage(
	action: Action = async () => ({ success: true }) as ActionResult,
) {
	const Stub = createRoutesStub([
		{
			path: '/reset-password',
			Component: ResetPasswordPage,
			loader: () => null,
			action,
		},
		{
			path: '/password-forgotten',
			Component: () => <ParamsProbe label="Numéro" />,
		},
		{ path: '/login', Component: () => <ParamsProbe label="Connexion" /> },
	])

	render(
		<Stub
			initialEntries={[`/reset-password?redirectTo=%2Fpublish&phone=${PHONE}`]}
		/>,
	)
}

const codeField = () => page.getByLabelText('Code de vérification')
const passwordField = () => page.getByLabelText('Mot de passe', { exact: true })
const confirmField = () => page.getByLabelText('Confirmer le mot de passe')
const submit = () =>
	page.getByRole('button', { name: /Changer mon mot de passe/ })
const heading = (name: string) => page.getByRole('heading', { name })

const CODE_HEADING = 'Le code reçu par SMS'
const PASSWORD_HEADING = 'Votre nouveau mot de passe'

/** The code step has no button: six digits are what moves the flow on. */
async function reachPasswordStep(code = CODE) {
	await userEvent.fill(codeField(), code)
	await expect.element(heading(PASSWORD_HEADING)).toBeInTheDocument()
}

async function fillPassword(value = PASSWORD) {
	await userEvent.fill(passwordField(), value)
	await userEvent.fill(confirmField(), value)
}

beforeEach(() => {
	success.mockClear()
	error.mockClear()
})

describe('ResetPasswordPage, the code step', () => {
	it('names the number it wrote to and lets it be corrected without retyping', async () => {
		renderPage()

		await expect.element(page.getByText(`+225 ${PHONE}`)).toBeInTheDocument()

		await userEvent.click(
			page.getByRole('button', { name: /Ce n’est pas le bon numéro/ }),
		)

		await expect
			.element(page.getByText(`Numéro ${PHONE} /publish`))
			.toBeInTheDocument()
	})

	// The password is asked for only once a code has been entered.
	it('opens the password step only once the code is complete', async () => {
		renderPage()

		await expect.element(heading(CODE_HEADING)).toBeInTheDocument()

		await userEvent.fill(codeField(), '1234')
		expect(heading(PASSWORD_HEADING).elements()).toHaveLength(0)

		await userEvent.fill(codeField(), CODE)
		await expect.element(heading(PASSWORD_HEADING)).toBeInTheDocument()
	})
})

describe('ResetPasswordPage, the password step', () => {
	// The measured bug: the code was checked only at the very end, and the screen
	// that reported it had thrown the typed password away.
	it('posts the code and the password together, then sends the visitor back where they came from', async () => {
		const submitted: Record<string, string> = {}
		renderPage(async ({ request }) => {
			for (const [key, value] of await request.formData()) {
				submitted[key] = String(value)
			}
			return { success: true } as ActionResult
		})

		await reachPasswordStep()
		await fillPassword()
		await userEvent.click(submit())

		await expect
			.element(page.getByText('Connexion - /publish'))
			.toBeInTheDocument()
		expect(success).toHaveBeenCalled()
		expect(submitted).toEqual({
			intent: 'reset-password',
			phoneNumber: PHONE,
			otp: CODE,
			newPassword: PASSWORD,
		})
	})

	// The code is the only thing the API can refuse here, so a refusal returns to
	// the code step — and must not cost the password already typed.
	it('returns to the marked code step and keeps the password typed', async () => {
		renderPage(
			async () =>
				({
					success: false,
					errors: { root: { type: 'custom', message: 'Code expiré' } },
				}) as ActionResult,
		)

		await reachPasswordStep()
		await fillPassword()
		await userEvent.click(submit())

		await expect.element(heading(CODE_HEADING)).toBeInTheDocument()
		await expect
			.element(page.getByText(/Code incorrect ou expiré/))
			.toBeInTheDocument()

		await userEvent.fill(codeField(), CODE)

		await expect.element(passwordField()).toHaveValue(PASSWORD)
		await expect.element(confirmField()).toHaveValue(PASSWORD)
	})

	// The submission used to be settled before it had started, so the very first
	// attempt always reported a refusal the API had never sent.
	it('does not report a refusal before the API has answered', async () => {
		renderPage()

		await reachPasswordStep()
		await fillPassword()
		await userEvent.click(submit())

		await expect
			.element(page.getByText('Connexion - /publish'))
			.toBeInTheDocument()
		expect(page.getByText(/Code incorrect ou expiré/).elements()).toHaveLength(
			0,
		)
	})

	it('refuses a password the rule rejects without spending the code', async () => {
		const action = vi.fn(async () => ({ success: true }) as ActionResult)
		renderPage(action)

		await reachPasswordStep()
		// Long enough, but no uppercase — a message the checklist does not also
		// carry, so the assertion cannot match the wrong element.
		await fillPassword('motdepasse1')
		await userEvent.click(submit())

		await expect
			.element(page.getByText('Au moins une majuscule'))
			.toBeInTheDocument()
		expect(action).not.toHaveBeenCalled()
	})
})
