import { createRoutesStub } from 'react-router'
import { cleanup, page, render, userEvent } from '@/shared/helpers/testing'
import { UserMenu } from '../user-menu'

function renderMenu(pendingStickers = 0) {
	const Stub = createRoutesStub([
		{
			path: '/',
			Component: () => (
				<UserMenu
					name="Joël Digbeu"
					phone="+2250700000000"
					onLogout={() => undefined}
					pendingStickers={pendingStickers}
				/>
			),
		},
	])
	render(<Stub initialEntries={['/']} />)
}

const open = () => userEvent.click(page.getByRole('button'))
const entry = (name: string | RegExp) => page.getByRole('menuitem', { name })

afterEach(cleanup)

/** Above `lg` there is no tab bar, so the menu carries the standing task. */
describe('the user menu', () => {
	it('reaches the stickers, and the scanner while some wait', async () => {
		renderMenu(8)
		await open()

		await expect.element(entry(/Mes stickers/)).toHaveAttribute('href', '/scan')
		await expect.element(page.getByText('8')).toBeVisible()
	})

	it('reaches the sticker list once none waits', async () => {
		renderMenu(0)
		await open()

		await expect
			.element(entry(/Mes stickers/))
			.toHaveAttribute('href', '/account/stickers')
	})

	it('carries the account and the settings either way', async () => {
		renderMenu(0)
		await open()

		await expect.element(entry('Mon compte')).toBeVisible()
		await expect.element(entry('Paramètres')).toBeVisible()
		await expect.element(entry('Déconnexion')).toBeVisible()
	})
})
