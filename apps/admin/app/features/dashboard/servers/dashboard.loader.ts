import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { requireAdminSession } from '@/shared/auth/auth.server'
import { apiFetch } from '@/shared/lib/api-client'

const CATEGORY_LABELS: Record<string, string> = {
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
	recentActivities: Array<{ id: string; type: string; text: string; createdAt: string }>
}

export async function dashboardLoader({ request }: { request: Request }) {
	await requireAdminSession(request)

	const data = await apiFetch<StatsApiResponse>('/stats', {
		headers: { Cookie: request.headers.get('cookie') ?? '' },
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
			category: CATEGORY_LABELS[row.category] ?? row.category,
			lost: row.lost,
			found: row.found,
		})),
		activities: data.recentActivities.map((a, i) => ({
			id: i + 1,
			type: a.type,
			text: a.text,
			timestamp: formatDistanceToNow(new Date(a.createdAt), {
				locale: fr,
				addSuffix: true,
			}),
		})),
	}
}
