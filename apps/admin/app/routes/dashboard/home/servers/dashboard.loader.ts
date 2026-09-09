import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { LostItemCategory } from '@app/contracts/lost-items'
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
	CLOTHING: 'Vêtements',
	JEWELRY: 'Bijoux',
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

export async function dashboardLoader({ request }: { request: Request }) {
	await requireAdminSession(request)

	const data = await apiFetch<StatsApiResponse>('/stats', {
		request,
	})

	return {
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
