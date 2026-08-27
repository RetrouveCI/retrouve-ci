import { createRoutesStub } from 'react-router'
import { OTP_RESEND_DELAY_SECONDS } from '@app/contracts/shared'
import { ASSIGNABLE_PHONE_ERROR_MESSAGE } from '@/shared/utils/phone'
import { page, render, userEvent } from '@/shared/helpers/testing'
import type { ActionResult } from '@/shared/types/action'
import RegisterPage from '../_index'

/**
 * The session is what the page reacts to, and verifying the code really creates
 * one — so it is driven here directly rather than by standing up better-auth.
 */
const auth = vi.hoisted(() => ({ signedIn: false }))

vi.mock('@/context/auth', () => ({
	useAuth: () => ({
		user: null,
		isAuthenticated: auth.signedIn,
		isLoading: false,
		login: vi.fn(),
		logout: vi.fn(),
	}),
}))

vi.mock('../../helpers/phone-auth.client', () => ({
	verifyPhoneOtp: vi.fn(async () => true),
}))

const PHONE = '0700000000'

type Action = (args: { request: Request }) => unknown

function renderPage(
	action: Action = () => ({ success: true }) as ActionResult,
) {
	const Stub = createRoutesStub([
		{
			path: '/auth/register',
			Component: RegisterPage,
			loader: () => null,
			action,
		},
		{ path: '/auth/login', Component: () => <p>Page de connexion</p> },
		{ path: '/publish', Component: () => <p>Page de publication</p> },
		{ path: '/account', Component: () => <p>Page du compte</p> },
	])

	render(<Stub initialEntries={['/auth/register?redirectTo=%2Fpublish']} />)
}

const phoneField = () => page.getByLabelText('Numéro de téléphone')
const submitPhone = () => page.getByRole('button', { name: 'Continuer' })
const goBack = () => page.getByRole('button', { name: 'Retour' })
const editPhone = () => page.getByRole('button', { name: 'Modifier le numéro' })
const resend = () => page.getByRole('button', { name: /Renvoyer le code/ })
const confirm = () => page.getByRole('button', { name: /Confirmer/ })
// By role, because the phone step's hint also carries the word "vérification".
const heading = (name: string) => page.getByRole('heading', { name })

async function reachOtpStep() {
	renderPage()
	await userEvent.fill(phoneField(), PHONE)
	await userEvent.click(submitPhone())
	await expect.element(heading('Vérification')).toBeInTheDocument()
}

beforeEach(() => {
	auth.signedIn = false
})

describe('RegisterPage, the phone step', () => {
	it('refuses a number no Ivorian operator issues', async () => {
		renderPage()

		await userEvent.fill(phoneField(), '0600000000')
		await userEvent.click(submitPhone())

		await expect
			.element(page.getByText(ASSIGNABLE_PHONE_ERROR_MESSAGE))
			.toBeInTheDocument()
		expect(heading('Vérification').elements()).toHaveLength(0)
	})

	// Invariant 2 of flow E: whoever came from "Publier" goes back to "Publier",
	// including by way of the sign-in link.
	it('carries redirectTo onto the sign-in link', async () => {
		renderPage()

		await expect
			.element(page.getByRole('link', { name: 'Se connecter' }))
			.toHaveAttribute('href', '/auth/login?redirectTo=%2Fpublish')
	})
})

describe('RegisterPage, the code step', () => {
	it('moves to the code step and names the number it wrote to', async () => {
		await reachOtpStep()

		await expect.element(page.getByText(`+225 ${PHONE}`)).toBeInTheDocument()
	})

	// The measured bug: the section was remounted with an empty default, so
	// correcting a typo meant retyping all ten digits.
	it.each([
		['Retour', goBack],
		['Modifier le numéro', editPhone],
	])('keeps the number when going back through %s', async (_label, control) => {
		await reachOtpStep()

		await userEvent.click(control())

		await expect.element(phoneField()).toHaveValue(PHONE)
	})

	// It used to appear only once the countdown hit zero. That the wait ends is
	// `use-otp-countdown.test.tsx`'s job; what this asserts is that the screen
	// shows the wait rather than hiding the control.
	it('shows the resend from the start, disabled and counting', async () => {
		await reachOtpStep()

		await expect.element(resend()).toBeDisabled()
		await expect
			.element(resend())
			.toHaveTextContent(`(${OTP_RESEND_DELAY_SECONDS} s)`)
	})

	it('holds Confirmer until the code is complete', async () => {
		await reachOtpStep()

		await expect.element(confirm()).toBeDisabled()

		await userEvent.fill(page.getByRole('textbox'), '123456')

		await expect.element(confirm()).toBeEnabled()
	})
})

describe('RegisterPage, once the code is verified', () => {
	// The bug: verifying the code signs the visitor in, and the guard that bounces
	// an already-authenticated visitor off this page fired on that new session —
	// landing them on `/account` with no password set and no way to set one,
	// since changing a password asks for the current one.
	it('stays on the password step even though the visitor is now signed in', async () => {
		await reachOtpStep()

		await userEvent.fill(page.getByRole('textbox'), '123456')
		auth.signedIn = true
		await userEvent.click(confirm())

		await expect.element(heading('Sécurisez votre compte')).toBeInTheDocument()
		expect(page.getByText('Page du compte').elements()).toHaveLength(0)
		expect(page.getByText('Page de publication').elements()).toHaveLength(0)
	})

	it('still bounces someone who was signed in before arriving', async () => {
		auth.signedIn = true
		renderPage()

		await expect
			.element(page.getByText('Page de publication'))
			.toBeInTheDocument()
	})
})
