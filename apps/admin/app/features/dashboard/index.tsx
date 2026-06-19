import { useState } from 'react'
import { PageHeader } from '@/shared/components/page-header'
import { DateRangePicker } from '@/shared/components/date-range-picker'
import { useAuth } from '@/shared/auth/auth-context'
import { StatCard } from './components/stat-card'
import { ActivityChart } from './components/activity-chart'
import { CategoryChart } from './components/category-chart'
import { PostsSummary } from './components/posts-summary'
import { RecentActivity } from './components/recent-activity'
import { dashboardLoader } from './servers/dashboard.loader'
import type { DateRange } from 'react-day-picker'
import type { RouteHandle } from '@/shared/lib/page-meta'
import type { Route } from './+types/index'
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
					accent="accent"
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
					accent="accent"
				/>
			</div>

			<div className="grid gap-4 lg:grid-cols-3">
				<ActivityChart data={activityChart} className="lg:col-span-2" />
				<PostsSummary
					lost={stats.postsLost}
					found={stats.postsFound}
					qrGenerated={stats.qrGenerated}
				/>
			</div>

			<div className="grid gap-4 lg:grid-cols-2">
				<CategoryChart data={categoryChart} />
				<RecentActivity activities={activities} />
			</div>
		</div>
	)
}
