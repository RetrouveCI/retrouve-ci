import { createRoutesStub } from 'react-router'
import { cleanup, page, render } from '@/shared/helpers/testing'
import { usePendingStickers } from '../use-pending-stickers'

const { useAuth } = vi.hoisted(() => ({ useAuth: vi.fn() }))
vi.mock('@/context/auth', () => ({ useAuth }))

const loader = vi.fn()

function Harness() {
	return <p>waiting {usePendingStickers()}</p>
}

function renderHook() {
	const Stub = createRoutesStub([
		{ path: '/', Component: Harness },
		{ path: '/account/stickers/pending', loader },
	])
	render(<Stub initialEntries={['/']} />)
}

beforeEach(() => {
	loader.mockReset().mockReturnValue({ pending: 9 })
	useAuth.mockReturnValue({ isAuthenticated: true })
})

afterEach(() => {
	cleanup()
	vi.restoreAllMocks()
})

/** Beside the shell, not in a root loader: see the hook for why. */
describe('the pending sticker count', () => {
	it('reads it once for a signed-in visitor', async () => {
		renderHook()

		await expect.element(page.getByText('waiting 9')).toBeVisible()
		expect(loader).toHaveBeenCalledTimes(1)
	})

	it('asks nothing at all when nobody is signed in', async () => {
		useAuth.mockReturnValue({ isAuthenticated: false })
		renderHook()

		await expect.element(page.getByText('waiting 0')).toBeVisible()
		expect(loader).not.toHaveBeenCalled()
	})

	// The badge must never take the shell down: the route already answers zero
	// on an unreachable API, and a reply that never comes reads the same.
	it('reads zero until the answer arrives', async () => {
		loader.mockReturnValue(new Promise(() => undefined))
		renderHook()

		await expect.element(page.getByText('waiting 0')).toBeVisible()
	})
})
