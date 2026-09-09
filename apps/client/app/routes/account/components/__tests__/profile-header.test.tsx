import { createRoutesStub } from 'react-router'
import { cleanup, page, render } from '@/shared/helpers/testing'
import type { User } from '@/shared/types/user'
import { ProfileHeader } from '../profile-header'
import '../../../../app.css'

const NARROW = 464

const USER: User = {
	id: 'user-1',
	name: 'Konan Yao',
	phone: '+2250700000000',
	createdAt: 'août 2026',
}

function mount(user: Partial<User> = {}) {
	const Stub = createRoutesStub([
		{
			path: '/account',
			Component: () => (
				<ProfileHeader user={{ ...USER, ...user }} onLogout={() => {}} />
			),
		},
	])
	render(<Stub initialEntries={['/account']} />)
}

const box = (element: Element) => element.getBoundingClientRect()

afterEach(() => cleanup())

describe('the account header on a narrow phone', () => {
	// Measured, not read: the avatar is a flex item with the default shrink, so
	// a tight row squashed a 72 px square into 72 × 68 — a 1.05:1 « circle ».
	it.each([320, NARROW, 640])(
		'keeps the avatar square at %o px',
		async width => {
			await page.viewport(width, 800)
			mount({ name: 'Anzoumanan-Kouassi Yaobla-Gnamien' })
			await expect.element(page.getByText('AY')).toBeInTheDocument()

			const measured = box(page.getByText('AY').element())

			expect(`${measured.width}x${measured.height}`).toBe('72x72')
		},
	)

	/**
	 * A name is untruncatable text in a flex item with no `min-w-0`, so its
	 * min-content width used to push the row past the viewport — the page
	 * scrolled sideways, which §2 forbids.
	 */
	it.each([
		['Konan Yao', 'a short name'],
		['Anzoumanan-Kouassi Yaobla-Gnamien', 'an unbreakable long name'],
	])('never scrolls sideways with %s (%s)', async name => {
		await page.viewport(NARROW, 800)
		mount({ name })
		await expect.element(page.getByRole('heading', { level: 1 })).toBeVisible()

		const root = document.documentElement

		expect(root.scrollWidth).toBeLessThanOrEqual(root.clientWidth)
	})
})
