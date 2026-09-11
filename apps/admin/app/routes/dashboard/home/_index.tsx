import { lazy, Suspense } from 'react'
import { useSearchParams } from 'react-router'
import { format } from 'date-fns'
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

export const handle: RouteHandle = { title: 'Tableau de bord' }

export default function DashboardPage({ loaderData }: Route.ComponentProps) {
	const { period, stats, activityChart, categoryChart, activities } = loaderData
	const { user } = useAuth()
	const [searchParams, setSearchParams] = useSearchParams()

	// The period lives in the URL, like every other filter of this backoffice:
	// a view is shared by its link, and the loader is what reads it.
	const dateRange: DateRange = {
		from: new Date(period.from),
		// The stored bound is exclusive; the picker shows the last day measured.
		to: new Date(new Date(period.to).getTime() - 1),
	}

	const changePeriod = (range: DateRange | undefined) => {
		const next = new URLSearchParams(searchParams)

		if (range?.from) next.set('from', format(range.from, 'yyyy-MM-dd'))
		else next.delete('from')
		if (range?.to) next.set('to', format(range.to, 'yyyy-MM-dd'))
		else next.delete('to')

		setSearchParams(next)
	}

	const reference = `${period.days} jour${period.days > 1 ? 's' : ''} précédents`

	const firstName = user?.name?.split(' ')[0] ?? 'Admin'

	return (
		<div className="space-y-6 p-4 lg:p-6">
			<PageHeader
				title={`Bonjour, ${firstName}`}
				description="Voici l'activité de RetrouveCI en un coup d'œil"
				actions={
					<DateRangePicker
						dateRange={dateRange}
						onDateRangeChange={changePeriod}
					/>
				}
			/>

			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<StatCard
					title="QR Codes actifs"
					value={stats.qrActivated.value}
					changeReference={reference}
					change={stats.qrActivated.change}
					icon={QrCode}
				/>
				<StatCard
					title="Scans totaux"
					value={stats.scans.value}
					changeReference={reference}
					change={stats.scans.change}
					icon={Scan}
					tone="accent"
				/>
				<StatCard
					title="Contacts"
					value={stats.contacts.value}
					changeReference={reference}
					change={stats.contacts.change}
					icon={Phone}
				/>
				<StatCard
					title="Nouveaux utilisateurs"
					value={stats.newUsers.value}
					changeReference={reference}
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
