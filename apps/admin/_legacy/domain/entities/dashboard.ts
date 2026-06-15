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

export interface ChartData {
	activity: ActivityChartPoint[]
	postsByCategory: CategoryChartPoint[]
}
