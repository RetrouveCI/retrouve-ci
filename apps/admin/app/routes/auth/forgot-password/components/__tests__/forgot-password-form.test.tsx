import { createRoutesStub } from 'react-router'
import { page, render, userEvent } from '@/shared/helpers/testing'
import type { ActionResult } from '@/shared/types/action'
import { ForgotPasswordForm } from '../forgot-password-form'

function renderForm(action: () => ActionResult) {
	const Stub = createRoutesStub([
		{
			path: '/forgot-password',
			Component: () => <ForgotPasswordForm />,
			action,
		},
	])

	render(<Stub initialEntries={['/forgot-password']} />)
}

const submit = () =>
	userEvent.click(
		page.getByRole('button', { name: 'Envoyer les instructions' }),
	)

describe('ForgotPasswordForm', () => {
	it('renders the email field and the submit button', async () => {
		renderForm(() => ({ success: true }))

		await expect.element(page.getByLabelText('Email')).toBeInTheDocument()
		await expect
			.element(page.getByRole('button', { name: 'Envoyer les instructions' }))
			.toBeInTheDocument()
	})

	it('rejects an invalid email before reaching the action', async () => {
		const action = vi.fn(() => ({ success: true }) as ActionResult)
		renderForm(action)

		await userEvent.fill(page.getByLabelText('Email'), 'pas-un-email')
		await submit()

		await expect.element(page.getByText('Email invalide')).toBeInTheDocument()
		expect(action).not.toHaveBeenCalled()
	})

	it('replaces the form with a confirmation once the action succeeds', async () => {
		renderForm(() => ({ success: true }))

		await userEvent.fill(page.getByLabelText('Email'), 'admin@retrouveci.com')
		await submit()

		await expect
			.element(page.getByText('Instructions envoyées'))
			.toBeInTheDocument()
		await expect
			.element(page.getByRole('button', { name: 'Envoyer les instructions' }))
			.not.toBeInTheDocument()
	})

	it('renders the API message as a root error and keeps the form', async () => {
		renderForm(() => ({
			success: false,
			errors: {
				root: { type: 'custom', message: 'Service momentanément indisponible' },
			},
		}))

		await userEvent.fill(page.getByLabelText('Email'), 'admin@retrouveci.com')
		await submit()

		await expect
			.element(page.getByText('Impossible d’envoyer les instructions'))
			.toBeInTheDocument()
		await expect
			.element(page.getByText('Service momentanément indisponible'))
			.toBeInTheDocument()
		await expect
			.element(page.getByRole('button', { name: 'Envoyer les instructions' }))
			.toBeInTheDocument()
	})

	it('lands a server-side field error on the field it belongs to', async () => {
		renderForm(() => ({
			success: false,
			errors: {
				email: {
					type: 'custom',
					message: 'Cet email n’est pas administrateur',
				},
			},
		}))

		await userEvent.fill(page.getByLabelText('Email'), 'admin@retrouveci.com')
		await submit()

		await expect
			.element(page.getByText('Cet email n’est pas administrateur'))
			.toBeInTheDocument()
	})
})
