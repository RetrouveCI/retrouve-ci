import { lazy, Suspense, useState } from 'react'
import { PageHeader } from '@/components/page-header'
import { DateRangePicker } from '@/components/date-range-picker'
import { useAuth } from '@/context/auth'
import { StatCard } from '@/components/stat-card'
import { ChartFallback } from './components/chart-fallback'
import { ACTIVITY_CHART, CATEGORY_CHART } from './components/chart-meta'
import { PostsSummary } from './components/posts-summary'
import { RecentActivity } from './components/recent-activity'
import { dashboardLoader } from './servers/dashboard.loader'
import type { DateRange } from 'react-day-picker'

/**
 * `recharts` is a third of this page's JavaScript and the dashboard is where
 * every administrator lands, so it is fetched after hydration rather than
 * shipped in the route chunk. `ChartFallback` wears the same card, heading and
 * legend and reserves the plot's exact height, so nothing moves when it lands.
 */
const ActivityChart = lazy(() =>
	import('./components/activity-chart').then(module => ({
		default: module.ActivityChart,
	})),
)

const CategoryChart = lazy(() =>
	import('./components/category-chart').then(module => ({
		default: module.CategoryChart,
	})),
)
import type { RouteHandle } from '@/shared/helpers/page-meta'
import type { Route } from './+types/_index'
import { QrCode, Scan, Phone, Users } from 'lucide-react'

export const loader = dashboardLoader

export const handle: RouteHandle = { title: 'Dashboard' }

export default function DashboardPage({ loaderData }: Route.ComponentProps) {
	const { stats, activityChart, categoryChart, activities } = loaderData
	const { user } = useAuth()
	const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)

	const firstName = user?.name?.split(' ')[0] ?? 'Admin'

	return (
		<div className="space-y-6 p-4 lg:p-6">
			<PageHeader
				title={`Bonjour, ${firstName}`}
				description="Voici l'activité de RetrouveCI en un coup d'œil"
				actions={
					<DateRangePicker
						dateRange={dateRange}
						onDateRangeChange={setDateRange}
					/>
				}
			/>

			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<StatCard
					title="QR Codes actifs"
					value={stats.qrActivated.value}
					change={stats.qrActivated.change}
					icon={QrCode}
				/>
				<StatCard
					title="Scans totaux"
					value={stats.scans.value}
					change={stats.scans.change}
					icon={Scan}
					tone="accent"
				/>
				<StatCard
					title="Contacts"
					value={stats.contacts.value}
					change={stats.contacts.change}
					icon={Phone}
				/>
				<StatCard
					title="Nouveaux utilisateurs"
					value={stats.newUsers.value}
					change={stats.newUsers.change}
					icon={Users}
					tone="accent"
				/>
			</div>

			<div className="grid gap-4 lg:grid-cols-3">
				<Suspense
					fallback={
						<ChartFallback meta={ACTIVITY_CHART} className="lg:col-span-2" />
					}
				>
					<ActivityChart data={activityChart} className="lg:col-span-2" />
				</Suspense>
				<PostsSummary
					lost={stats.postsLost}
					found={stats.postsFound}
					qrGenerated={stats.qrGenerated}
				/>
			</div>

			<div className="grid gap-4 lg:grid-cols-2">
				<Suspense fallback={<ChartFallback meta={CATEGORY_CHART} />}>
					<CategoryChart data={categoryChart} />
				</Suspense>
				<RecentActivity activities={activities} />
			</div>
		</div>
	)
}
