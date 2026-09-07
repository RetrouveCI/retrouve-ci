import { createRoutesStub } from 'react-router'
import { cleanup, page, render } from '@/shared/helpers/testing'
import { AccountStats } from '../account-stats'
import { AccountNav } from '../account-nav'
import { ActivitySummary } from '../activity-summary'
import { RecentListings } from '../recent-listings'
import '../../../../app.css'

const NARROW = 464

function mount(node: React.ReactNode) {
	const Stub = createRoutesStub([
		{ path: '/account', Component: () => <>{node}</> },
	])
	render(<Stub initialEntries={['/account']} />)
}

afterEach(() => cleanup())

/** Names the offender, since « something overflows » is not a bug report. */
function widest() {
	let worst = { tag: '', overflow: 0 }

	for (const el of document.querySelectorAll('*')) {
		const over = el.scrollWidth - el.clientWidth

		if (over > worst.overflow)
			worst = {
				tag: `${el.tagName}.${String(el.className)}`.slice(0, 140),
				overflow: over,
			}
	}

	return worst
}

const listing = {
	id: 'post-1',
	title: 'Portefeuille en cuir marron avec CNI et carte bancaire à l’intérieur',
	description: 'Perdu près du marché de Cocody, dans un gbaka.',
	location: 'Cocody, Abidjan',
	date: '30 août',
	type: 'lost' as const,
	category: 'wallet',
	status: 'active' as const,
	moderationStatus: 'published' as const,
	createdAt: '2026-08-30T10:00:00.000Z',
	views: 412,
	contacts: 3,
}

const sticker = {
	id: 'qr-1',
	code: 'RCI-4A7F-2K91',
	status: 'activated' as const,
	isActive: true,
	label: 'Clés de la maison',
	linkedObject: null,
	directContact: false,
	activatedAt: '2026-08-14T10:00:00.000Z',
	lastScannedAt: null,
	messagesCount: 0,
}

const summary = {
	posts: { total: 12, active: 9, pending: 3 },
	stickers: { total: 12, activated: 3 },
	orders: { total: 4, inProgress: 1 },
	unreadNotifications: 7,
}

// Factories rather than elements: an array of JSX has no keys to give.
const blocks: [string, () => React.ReactNode][] = [
	['stats', () => <AccountStats stickers={[sticker]} listings={[listing]} />],
	[
		'nav',
		() => (
			<AccountNav stickers={[sticker]} listings={[listing]} ordersCount={3} />
		),
	],
	['activity', () => <ActivitySummary summary={summary} />],
	['recent', () => <RecentListings listings={[listing, listing]} />],
]

/**
 * The passation reported `/account` overflowing at 464 px. Measured block by
 * block with a 68-character listing title, nothing does — so this is the guard
 * that keeps it that way rather than a fix. 464 px is the width it named; the
 * assertion names the offender, since a bare failure would say nothing.
 */
describe('the account page on a 464 px phone', () => {
	it.each(blocks)('never scrolls sideways: %s', async (_label, block) => {
		await page.viewport(NARROW, 900)
		mount(block())

		const root = document.documentElement

		expect(JSON.stringify(widest())).toBe('{"tag":"","overflow":0}')
		expect(root.scrollWidth).toBeLessThanOrEqual(root.clientWidth)
	})
})
