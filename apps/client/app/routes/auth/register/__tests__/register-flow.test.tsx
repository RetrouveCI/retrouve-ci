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

const { verifyPhoneOtp } = vi.hoisted(() => ({
	verifyPhoneOtp: vi.fn(async () => true),
}))

vi.mock('../../helpers/phone-auth.client', () => ({ verifyPhoneOtp }))

const PHONE = '0700000000'
const CODE = '123456'

type Action = (args: { request: Request }) => unknown

function renderPage(
	action: Action = async () => ({ success: true }) as ActionResult,
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
const codeField = () => page.getByLabelText('Code de vérification')
const submitPhone = () =>
	page.getByRole('button', { name: 'Recevoir mon code' })
const goBack = () => page.getByRole('button', { name: 'Retour' })
const editPhone = () =>
	page.getByRole('button', { name: /Ce n’est pas le bon numéro/ })
const resend = () => page.getByRole('button', { name: 'Renvoyer le code' })
// By role, because the phone step's rule card also carries the word "code".
const heading = (name: string) => page.getByRole('heading', { name })

const CODE_HEADING = 'Le code reçu par SMS'
const PASSWORD_HEADING = 'Votre mot de passe'

async function reachOtpStep() {
	renderPage()
	await userEvent.fill(phoneField(), PHONE)
	await userEvent.click(submitPhone())
	await expect.element(heading(CODE_HEADING)).toBeInTheDocument()
}

beforeEach(() => {
	auth.signedIn = false
	verifyPhoneOtp.mockClear().mockResolvedValue(true)
})

describe('RegisterPage, the phone step', () => {
	it('refuses a number no Ivorian operator issues', async () => {
		renderPage()

		await userEvent.fill(phoneField(), '0600000000')
		await userEvent.click(submitPhone())

		await expect
			.element(page.getByText(ASSIGNABLE_PHONE_ERROR_MESSAGE))
			.toBeInTheDocument()
		expect(heading(CODE_HEADING).elements()).toHaveLength(0)
	})

	// Invariant 2 of flow E: whoever came from "Publier" goes back to "Publier",
	// including by way of the sign-in link.
	it('carries redirectTo onto the sign-in link', async () => {
		renderPage()

		await expect
			.element(page.getByRole('link', { name: 'Se connecter' }))
			.toHaveAttribute('href', '/auth/login?redirectTo=%2Fpublish')
	})

	// The rule is advertised only where a number is written for the first time.
	it('names the Ivorian rule it enforces', async () => {
		renderPage()

		await expect
			.element(page.getByText('Numéros ivoiriens uniquement'))
			.toBeInTheDocument()
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
		['Ce n’est pas le bon numéro', editPhone],
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
			.element(page.getByText(/Possible dans/))
			.toHaveTextContent(`${OTP_RESEND_DELAY_SECONDS} s`)
	})

	// The mockup gives this step no button: the six digits are the submission.
	it('verifies the code only once all six digits are in', async () => {
		await reachOtpStep()

		await userEvent.fill(codeField(), '1234')
		expect(verifyPhoneOtp).not.toHaveBeenCalled()

		await userEvent.fill(codeField(), CODE)

		await expect.element(heading(PASSWORD_HEADING)).toBeInTheDocument()
		expect(verifyPhoneOtp).toHaveBeenCalledWith(PHONE, CODE)
	})

	it('marks a refused code on the boxes and stays put', async () => {
		await reachOtpStep()
		verifyPhoneOtp.mockResolvedValue(false)

		await userEvent.fill(codeField(), CODE)

		await expect
			.element(page.getByText('Code incorrect. Vérifiez et réessayez.'))
			.toBeInTheDocument()
		expect(heading(PASSWORD_HEADING).elements()).toHaveLength(0)
	})
})

describe('RegisterPage, once the code is verified', () => {
	// The bug: verifying the code signs the visitor in, and the guard that bounces
	// an already-authenticated visitor off this page fired on that new session —
	// landing them on `/account` with no password set and no way to set one,
	// since changing a password asks for the current one.
	it('stays on the password step even though the visitor is now signed in', async () => {
		await reachOtpStep()

		auth.signedIn = true
		await userEvent.fill(codeField(), CODE)

		await expect.element(heading(PASSWORD_HEADING)).toBeInTheDocument()
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
