import { createRoutesStub } from 'react-router'
import { cleanup, page, render } from '@/shared/helpers/testing'
import { DevicePushRow } from '../device-push-row'

// The refusal path, which is the one a headless run can reach: no
// `VAPID_PUBLIC_KEY`, so the switch must say so rather than offer a dead
// button. A granted prompt needs a real device.
function renderRow() {
	const Stub = createRoutesStub([
		{ path: '/', Component: () => <DevicePushRow />, action: () => null },
	])
	render(<Stub initialEntries={['/']} />)
}

const toggle = () =>
	page.getByRole('switch', { name: 'Notifications sur cet appareil' })

afterEach(() => {
	cleanup()
})

describe('the device push row', () => {
	it('names the device, not the account', async () => {
		renderRow()

		await expect
			.element(page.getByText('Notifications sur cet appareil'))
			.toBeVisible()
	})

	it('offers no working switch without a configured key', async () => {
		renderRow()

		await expect.element(toggle()).toBeDisabled()
	})

	it('says why rather than leaving the row mute', async () => {
		renderRow()

		await expect
			.element(
				page.getByText(
					'Les notifications ne sont pas encore activées côté serveur.',
				),
			)
			.toBeVisible()
	})

	// The switch reflects the browser, so it must never start on.
	it('starts off', async () => {
		renderRow()

		await expect.element(toggle()).not.toBeChecked()
	})
})
