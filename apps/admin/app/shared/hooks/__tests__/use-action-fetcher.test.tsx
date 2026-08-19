import { createRoutesStub } from 'react-router'
import { page, render, userEvent } from '@/shared/helpers/testing'
import type { ActionResult } from '@/shared/types/action'
import { useActionFetcher } from '../use-action-fetcher'

interface ProbeForm {
	email: string
}

/**
 * Renders the whole fetcher state as text so a test can assert on it. `label`
 * namespaces the test ids, which lets one route mount two probes and check they
 * stay independent.
 */
function Probe({ label = 'probe' }: { label?: string }) {
	const fetcher = useActionFetcher<ActionResult, ProbeForm>()

	return (
		<fetcher.Form method="post">
			<input type="hidden" name="from" value={label} />
			<button type="submit">Envoyer {label}</button>
			<p data-testid={`${label}-ok`}>{String(fetcher.isOk)}</p>
			<p data-testid={`${label}-root`}>{fetcher.errors?.root?.message ?? ''}</p>
			<p data-testid={`${label}-email`}>
				{fetcher.errors?.email?.message ?? ''}
			</p>
		</fetcher.Form>
	)
}

function renderProbe(
	action: () => ActionResult,
	Component: () => React.ReactElement = () => <Probe />,
) {
	const Stub = createRoutesStub([{ path: '/', Component, action }])
	render(<Stub />)
}

describe('useActionFetcher', () => {
	it('reports success once the action answers { success: true }', async () => {
		renderProbe(() => ({ success: true }))

		await expect
			.element(page.getByTestId('probe-ok'))
			.toHaveTextContent('false')

		await userEvent.click(page.getByRole('button', { name: /envoyer/i }))

		await expect.element(page.getByTestId('probe-ok')).toHaveTextContent('true')
		await expect.element(page.getByTestId('probe-root')).toHaveTextContent('')
	})

	it('exposes the action errors keyed by field, root included', async () => {
		renderProbe(() => ({
			success: false,
			errors: {
				email: { type: 'custom', message: 'Adresse e-mail invalide.' },
				root: { type: 'custom', message: 'Identifiants incorrects.' },
			},
		}))

		await userEvent.click(page.getByRole('button', { name: /envoyer/i }))

		await expect
			.element(page.getByTestId('probe-root'))
			.toHaveTextContent('Identifiants incorrects.')
		await expect
			.element(page.getByTestId('probe-email'))
			.toHaveTextContent('Adresse e-mail invalide.')
		await expect
			.element(page.getByTestId('probe-ok'))
			.toHaveTextContent('false')
	})

	it('keeps two forms independent without being given a key', async () => {
		renderProbe(
			() => ({ success: true }),
			() => (
				<>
					<Probe label="first" />
					<Probe label="second" />
				</>
			),
		)

		await userEvent.click(page.getByRole('button', { name: /envoyer first/i }))

		await expect.element(page.getByTestId('first-ok')).toHaveTextContent('true')
		await expect
			.element(page.getByTestId('second-ok'))
			.toHaveTextContent('false')
	})
})
