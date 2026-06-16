export interface StatValue {
	value: number
	change: number
}

export interface DashboardStats {
	qrGenerated: StatValue
	qrActivated: StatValue
	scans: StatValue
	contacts: StatValue
	postsLost: StatValue
	postsFound: StatValue
	newUsers: StatValue
}

export interface ActivityChartPoint {
	date: string
	scans: number
	activations: number
	contacts: number
}

export interface CategoryChartPoint {
	category: string
	lost: number
	found: number
}

export interface Activity {
	id: number
	type: string
	text: string
	timestamp: string
}

const MOCK_STATS: DashboardStats = {
	qrGenerated: { value: 2847, change: 12 },
	qrActivated: { value: 1523, change: 8 },
	scans: { value: 342, change: 24 },
	contacts: { value: 89, change: 0 },
	postsLost: { value: 156, change: -5 },
	postsFound: { value: 94, change: 15 },
	newUsers: { value: 67, change: 12 },
}

const MOCK_ACTIVITY_CHART: ActivityChartPoint[] = [
	{ date: '01 Mar', scans: 45, activations: 12, contacts: 8 },
	{ date: '05 Mar', scans: 52, activations: 15, contacts: 11 },
	{ date: '10 Mar', scans: 38, activations: 8, contacts: 6 },
	{ date: '15 Mar', scans: 65, activations: 22, contacts: 14 },
	{ date: '20 Mar', scans: 48, activations: 18, contacts: 9 },
	{ date: '25 Mar', scans: 72, activations: 25, contacts: 18 },
	{ date: '30 Mar', scans: 58, activations: 20, contacts: 12 },
]

const MOCK_CATEGORY_CHART: CategoryChartPoint[] = [
	{ category: 'Documents', lost: 45, found: 28 },
	{ category: 'Téléphones', lost: 38, found: 15 },
	{ category: 'Portefeuilles', lost: 32, found: 22 },
	{ category: 'Clés', lost: 28, found: 35 },
	{ category: 'Sacs', lost: 18, found: 12 },
	{ category: 'Autres', lost: 25, found: 18 },
]

const MOCK_ACTIVITIES: Activity[] = [
	{
		id: 1,
		type: 'scan',
		text: 'QR Code #8392 scanné à Cocody',
		timestamp: 'Il y a 2 min',
	},
	{
		id: 2,
		type: 'user',
		text: 'Nouvel utilisateur inscrit: Aminata D.',
		timestamp: 'Il y a 15 min',
	},
	{
		id: 3,
		type: 'post',
		text: 'Nouveau post "Clés perdues" signalé',
		timestamp: 'Il y a 32 min',
	},
	{
		id: 4,
		type: 'contact',
		text: 'Contact établi pour le post #123',
		timestamp: 'Il y a 1h',
	},
	{
		id: 5,
		type: 'scan',
		text: 'QR Code #7732 scanné au Plateau',
		timestamp: 'Il y a 1h 30min',
	},
	{
		id: 6,
		type: 'user',
		text: 'Utilisateur Ibrahim K. désactivé',
		timestamp: 'Il y a 2h',
	},
]

import { requireAdminSession } from '@/shared/auth/auth.server'

export async function dashboardLoader({ request }: { request: Request }) {
	await requireAdminSession(request)
	return {
		stats: MOCK_STATS,
		activityChart: MOCK_ACTIVITY_CHART,
		categoryChart: MOCK_CATEGORY_CHART,
		activities: MOCK_ACTIVITIES.slice(0, 6),
	}
}
