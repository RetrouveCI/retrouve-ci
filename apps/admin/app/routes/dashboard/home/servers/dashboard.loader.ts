import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { LostItemCategory } from '@app/contracts/lost-items'
import { dashboardPeriodSchema, resolvePeriod } from '@app/contracts/reporting'
import { requireAdminSession } from '@/shared/helpers/session.server'
import { apiFetch } from '@/shared/utils/api-fetch'

// The API reads the column as text, so it sends the Prisma enum's casing, which
// `Uppercase<>` derives: a category added to the contract fails to compile here.
const CATEGORY_LABELS: Record<Uppercase<LostItemCategory>, string> = {
	PHONE: 'Téléphones',
	KEYS: 'Clés',
	WALLET: 'Portefeuilles',
	BAG: 'Sacs',
	ELECTRONICS: 'Électronique',
	DOCUMENTS: 'Documents',
	OTHER: 'Autres',
}

interface StatsApiResponse {
	qrGenerated: { value: number; change: number }
	qrActivated: { value: number; change: number }
	scans: { value: number; change: number }
	contacts: { value: number; change: number }
	postsLost: { value: number; change: number }
	postsFound: { value: number; change: number }
	newUsers: { value: number; change: number }
	activityChart: Array<{ date: string; scans: number; activations: number }>
	categoryChart: Array<{ category: string; lost: number; found: number }>
	recentActivities: Array<{
		id: string
		type: string
		text: string
		createdAt: string
	}>
}

function categoryLabel(category: string): string {
	return CATEGORY_LABELS[category as Uppercase<LostItemCategory>] ?? category
}

const DAY_MS = 24 * 60 * 60 * 1000

export async function dashboardLoader({ request }: { request: Request }) {
	await requireAdminSession(request)

	const url = new URL(request.url)
	// A hand-edited bound is dropped rather than turned into an error page; the
	// API answers the last thirty days when it is given neither.
	const period =
		dashboardPeriodSchema.safeParse({
			from: url.searchParams.get('from') ?? undefined,
			to: url.searchParams.get('to') ?? undefined,
		}).data ?? {}

	const query = new URLSearchParams()
	if (period.from) query.set('from', period.from)
	if (period.to) query.set('to', period.to)

	const data = await apiFetch<StatsApiResponse>(
		query.size ? `/stats?${query.toString()}` : '/stats',
		{ request },
	)

	// The same resolution the API applies, so the page can say what the figures
	// are compared against rather than showing a percentage of nothing named.
	const { from, to } = resolvePeriod(period)

	return {
		period: {
			from: from.toISOString(),
			to: to.toISOString(),
			days: Math.max(1, Math.round((to.getTime() - from.getTime()) / DAY_MS)),
		},
		stats: {
			qrGenerated: data.qrGenerated,
			qrActivated: data.qrActivated,
			scans: data.scans,
			contacts: data.contacts,
			postsLost: data.postsLost,
			postsFound: data.postsFound,
			newUsers: data.newUsers,
		},
		activityChart: data.activityChart,
		categoryChart: data.categoryChart.map(row => ({
			category: categoryLabel(row.category),
			lost: row.lost,
			found: row.found,
		})),
		// The API's own id: renumbering by position discarded it, and the React
		// key would not have survived a sort.
		activities: data.recentActivities.map(activity => ({
			id: activity.id,
			type: activity.type,
			text: activity.text,
			timestamp: formatDistanceToNow(new Date(activity.createdAt), {
				locale: fr,
				addSuffix: true,
			}),
		})),
	}
}
