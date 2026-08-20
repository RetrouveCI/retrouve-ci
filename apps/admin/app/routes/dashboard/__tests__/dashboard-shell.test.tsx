import { createRoutesStub, useFetcher } from 'react-router'
import { page, render, userEvent } from '@/shared/helpers/testing'
import { ThemeProvider } from '@/context/theme'
import DashboardLayout from '../layout'

vi.mock('@/context/auth', () => ({
	useAuth: () => ({
		user: { name: 'Awa Koné', email: 'awa@retrouve.ci', role: 'admin' },
		isLoading: false,
		login: vi.fn(),
		logout: vi.fn(),
	}),
}))

// A fetcher, like the real notifications page — a native form submission would
// reload the browser-mode iframe.
function MarkReadChild() {
	const fetcher = useFetcher()
	return (
		<fetcher.Form method="post">
			<button type="submit">Marquer comme lu</button>
		</fetcher.Form>
	)
}

interface LoaderResult {
	sidebarCollapsed: boolean
	counts: { notificationsUnread: number }
}

function renderShell(
	loader: () => LoaderResult,
	action: () => unknown = () => ({ ok: true }),
) {
	const Stub = createRoutesStub([
		{
			path: '/',
			Component: DashboardLayout,
			loader,
			children: [
				{
					index: true,
					handle: { title: 'Tableau de bord' },
					Component: MarkReadChild,
					action,
				},
			],
		},
	])

	render(
		<ThemeProvider initialTheme="light">
			<Stub initialEntries={['/']} />
		</ThemeProvider>,
	)
}

const badge = (value: string) => page.getByText(value, { exact: true }).first()

afterEach(() => {
	vi.restoreAllMocks()
})

describe('the dashboard shell badge', () => {
	it('reads the unread count from the layout loader', async () => {
		renderShell(() => ({
			sidebarCollapsed: false,
			counts: { notificationsUnread: 3 },
		}))

		await expect.element(badge('3')).toBeInTheDocument()
	})

	it('shows no badge when nothing is unread', async () => {
		renderShell(() => ({
			sidebarCollapsed: false,
			counts: { notificationsUnread: 0 },
		}))

		await expect
			.element(page.getByText('Tableau de bord').first())
			.toBeInTheDocument()
		expect(page.getByText('0', { exact: true }).elements()).toHaveLength(0)
	})

	// The count used to be fetched once, in a mount effect, so marking a
	// notification read left a stale badge until a full reload. Coming from the
	// loader, it revalidates with every action.
	it('refreshes the badge when an action revalidates the loader', async () => {
		let unread = 3
		const loader = vi.fn(() => ({
			sidebarCollapsed: false,
			counts: { notificationsUnread: unread },
		}))

		renderShell(loader, () => {
			unread = 1
			return { ok: true }
		})

		await expect.element(badge('3')).toBeInTheDocument()

		await userEvent.click(
			page.getByRole('button', { name: 'Marquer comme lu' }),
		)

		await expect.element(badge('1')).toBeInTheDocument()
		expect(loader).toHaveBeenCalledTimes(2)
	})
})
