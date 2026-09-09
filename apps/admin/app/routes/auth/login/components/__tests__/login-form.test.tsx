import { createRoutesStub } from 'react-router'
import { page, render, userEvent } from '@/shared/helpers/testing'
import { LoginForm } from '../login-form'

const { login } = vi.hoisted(() => ({ login: vi.fn() }))

vi.mock('@/context/auth', () => ({
	useAuth: () => ({ user: null, isLoading: false, login, logout: vi.fn() }),
}))

function renderLogin(initialEntry = '/login') {
	const Stub = createRoutesStub([
		{ path: '/login', Component: () => <LoginForm /> },
		{ path: '/', Component: () => <p>Tableau de bord</p> },
		{ path: '/qr', Component: () => <p>Jetons QR</p> },
	])

	render(<Stub initialEntries={[initialEntry]} />)
}

async function fillCredentials() {
	await userEvent.fill(page.getByLabelText('Email'), 'admin@retrouveci.com')
	await userEvent.fill(page.getByLabelText('Mot de passe'), 'motdepasse')
}

describe('LoginForm', () => {
	beforeEach(() => {
		login.mockReset()
	})

	it('renders both fields, the submit button and the forgot-password link', async () => {
		renderLogin()

		await expect.element(page.getByLabelText('Email')).toBeInTheDocument()
		await expect
			.element(page.getByLabelText('Mot de passe'))
			.toBeInTheDocument()
		await expect
			.element(page.getByRole('button', { name: 'Se connecter' }))
			.toBeInTheDocument()
		await expect
			.element(page.getByRole('link', { name: /mot de passe oublié/i }))
			.toBeInTheDocument()
	})

	it('reports the schema messages on an empty submit without calling the API', async () => {
		renderLogin()

		await userEvent.click(page.getByRole('button', { name: 'Se connecter' }))

		await expect.element(page.getByText('Email invalide')).toBeInTheDocument()
		await expect
			.element(page.getByText('Mot de passe requis'))
			.toBeInTheDocument()
		expect(login).not.toHaveBeenCalled()
	})

	it('renders a failed sign-in as a root error, not a toast', async () => {
		login.mockResolvedValue({
			success: false,
			error: 'Email ou mot de passe incorrect',
		})
		renderLogin()

		await fillCredentials()
		await userEvent.click(page.getByRole('button', { name: 'Se connecter' }))

		await expect
			.element(page.getByText('Erreur lors de la connexion'))
			.toBeInTheDocument()
		await expect
			.element(page.getByText('Email ou mot de passe incorrect'))
			.toBeInTheDocument()
	})

	it('lands on the dashboard home when no redirectTo is given', async () => {
		login.mockResolvedValue({ success: true })
		renderLogin()

		await fillCredentials()
		await userEvent.click(page.getByRole('button', { name: 'Se connecter' }))

		await expect.element(page.getByText('Tableau de bord')).toBeInTheDocument()
	})

	it('honours the redirectTo query param on success', async () => {
		login.mockResolvedValue({ success: true })
		renderLogin('/login?redirectTo=%2Fqr')

		await fillCredentials()
		await userEvent.click(page.getByRole('button', { name: 'Se connecter' }))

		await expect.element(page.getByText('Jetons QR')).toBeInTheDocument()
	})

	it('ignores an external redirectTo and falls back to the dashboard home', async () => {
		login.mockResolvedValue({ success: true })
		renderLogin('/login?redirectTo=https%3A%2F%2Fevil.example')

		await fillCredentials()
		await userEvent.click(page.getByRole('button', { name: 'Se connecter' }))

		await expect.element(page.getByText('Tableau de bord')).toBeInTheDocument()
	})
})
