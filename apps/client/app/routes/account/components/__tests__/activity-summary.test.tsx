import { createRoutesStub } from 'react-router'
import { cleanup, page, render } from '@/shared/helpers/testing'
import type { ActivitySummary as Summary } from '@/shared/types/activity'
import { ActivitySummary } from '../activity-summary'

/**
 * R6 removed the floating activity bubble and put what it said on the screen it
 * described. Its rows were links, and that is the part worth keeping: each
 * number is still a way in.
 */
const SUMMARY: Summary = {
	posts: { total: 5, active: 3, pending: 1 },
	stickers: { total: 12, activated: 4 },
	orders: { total: 2, inProgress: 1 },
	unreadNotifications: 2,
}

function renderSummary(summary: Summary | null) {
	const Stub = createRoutesStub([
		{ path: '/', Component: () => <ActivitySummary summary={summary} /> },
	])
	render(<Stub initialEntries={['/']} />)
}

afterEach(cleanup)

describe('ActivitySummary', () => {
	it.each([
		[/alertes non lues/, '/notifications', '2'],
		[/annonces en ligne/, '/account/posts', '3'],
		[/commande en cours/, '/account/orders', '1'],
	])('%s leads to %s', async (name, href, value) => {
		renderSummary(SUMMARY)
		const tile = page.getByRole('link', { name })

		await expect.element(tile).toHaveAttribute('href', href)
		await expect.element(tile).toHaveTextContent(value)
	})

	// The summary is a convenience: a screen must not fail around a missing one.
	it('renders nothing when the summary could not be read', async () => {
		renderSummary(null)

		expect(await page.getByRole('link').elements()).toHaveLength(0)
	})

	it('says alerte in the singular when there is one', async () => {
		renderSummary({ ...SUMMARY, unreadNotifications: 1 })

		await expect.element(page.getByText('alerte non lue')).toBeInTheDocument()
	})
})
