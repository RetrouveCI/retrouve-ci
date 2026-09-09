import { createRoutesStub } from 'react-router'
import { cleanup, page, render } from '@/shared/helpers/testing'
import { NameReminder } from '../name-reminder'

afterEach(cleanup)

describe('NameReminder', () => {
	it('sends the visitor to the settings row that fixes it', async () => {
		const Stub = createRoutesStub([
			{ path: '/account', Component: () => <NameReminder /> },
		])
		render(<Stub initialEntries={['/account']} />)

		await expect
			.element(page.getByRole('link', { name: 'Renseigner mon nom' }))
			.toHaveAttribute('href', '/account/settings')
	})
})
