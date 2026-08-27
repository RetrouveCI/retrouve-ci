import { createRoutesStub } from 'react-router'
import { cleanup, page, render, userEvent } from '@/shared/helpers/testing'
import type { ActivitySummary } from '@/shared/types/activity'
import { ActivityHub } from '../activity-hub'

const { useAuth } = vi.hoisted(() => ({ useAuth: vi.fn() }))

vi.mock('@/context/auth', () => ({ useAuth }))

const SUMMARY: ActivitySummary = {
	posts: { total: 7, active: 5, pending: 2 },
	stickers: { total: 4, activated: 2 },
	orders: { total: 3, inProgress: 1 },
	unreadNotifications: 3,
}

function renderHub(
	loader: () => { summary: ActivitySummary | null } = () => ({
		summary: SUMMARY,
	}),
) {
	const spy = vi.fn(loader)
	const Stub = createRoutesStub([
		{ path: '/', Component: ActivityHub },
		{ path: '/account/activity', loader: spy },
	])

	render(<Stub initialEntries={['/']} />)
	return spy
}

const trigger = () => page.getByRole('button', { name: 'Mon activité' })

beforeEach(() => {
	useAuth.mockReturnValue({ isAuthenticated: true, isLoading: false })
})

afterEach(() => {
	// One React root per test: a second `render` in the same test breaks the
	// browser-mode container.
	cleanup()
	vi.restoreAllMocks()
})

describe('ActivityHub', () => {
	it.each([
		[
			'the session is still unknown',
			{ isAuthenticated: false, isLoading: true },
		],
		['the visitor is anonymous', { isAuthenticated: false, isLoading: false }],
	])('renders nothing while %s', (_label, auth) => {
		useAuth.mockReturnValue(auth)

		const loader = renderHub()

		expect(trigger().elements()).toHaveLength(0)
		expect(loader).not.toHaveBeenCalled()
	})

	// The dot is the whole reason the summary is read before the panel is opened.
	it('reads the summary through the resource route as soon as it mounts', async () => {
		const loader = renderHub()

		await vi.waitFor(() => expect(loader).toHaveBeenCalledTimes(1))
		await expect.element(trigger()).toBeInTheDocument()
	})

	it('shows the counts the loader answers with', async () => {
		renderHub()

		await userEvent.click(trigger())

		await expect.element(page.getByText('Annonces')).toBeInTheDocument()
		await expect
			.element(page.getByText('5 actives, 2 en attente'))
			.toBeInTheDocument()
		await expect.element(page.getByText('2 actifs')).toBeInTheDocument()
		await expect.element(page.getByText('1 en cours')).toBeInTheDocument()
		await expect.element(page.getByText('3 non lues')).toBeInTheDocument()
	})

	// Opening is when the numbers matter, so they are re-read then.
	it('re-reads the summary on open', async () => {
		const loader = renderHub()

		await vi.waitFor(() => expect(loader).toHaveBeenCalledTimes(1))

		await userEvent.click(trigger())

		await vi.waitFor(() => expect(loader).toHaveBeenCalledTimes(2))
	})

	it('reports a summary it could not load, rather than empty rows', async () => {
		renderHub(() => ({ summary: null }))

		await userEvent.click(trigger())

		await expect
			.element(page.getByText('Impossible de charger les données'))
			.toBeInTheDocument()
	})
})
