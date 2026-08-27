export interface StatValue {
	value: number
	change: number
}

export interface ActivityChartPoint {
	date: string
	scans: number
	activations: number
}

export interface CategoryChartPoint {
	category: string
	lost: number
	found: number
}

export interface RecentActivity {
	id: string
	type: string
	text: string
	createdAt: string
}

export interface DashboardStats {
	qrGenerated: StatValue
	qrActivated: StatValue
	scans: StatValue
	contacts: StatValue
	postsLost: StatValue
	postsFound: StatValue
	newUsers: StatValue
	activityChart: ActivityChartPoint[]
	categoryChart: CategoryChartPoint[]
	recentActivities: RecentActivity[]
}
