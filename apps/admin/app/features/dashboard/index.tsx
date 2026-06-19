import { useState } from 'react'
import { BentoCard } from '@/shared/components/bento-card'
import { PageHeader } from '@/shared/components/page-header'
import { DateRangePicker } from '@/shared/components/date-range-picker'
import { ActivityChart } from './components/activity-chart'
import { CategoryChart } from './components/category-chart'
import { RecentActivity } from './components/recent-activity'
import { dashboardLoader } from './servers/dashboard.loader'
import type { DateRange } from 'react-day-picker'
import type { RouteHandle } from '@/shared/lib/page-meta'
import type { Route } from './+types/index'
import {
	QrCode,
	CheckCircle2,
	Scan,
	Phone,
	AlertTriangle,
	Users,
} from 'lucide-react'

export const loader = dashboardLoader

export const handle: RouteHandle = { title: 'Dashboard' }

export default function DashboardPage({ loaderData }: Route.ComponentProps) {
	const { stats, activityChart, categoryChart, activities } = loaderData
	const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)

	return (
		<div className="p-4 lg:p-6">
			<PageHeader
				title="Bienvenue sur RetrouveCI"
				description="Voici un aperçu de votre plateforme"
				actions={
					<DateRangePicker
						dateRange={dateRange}
						onDateRangeChange={setDateRange}
					/>
				}
				className="mb-8"
			/>

			<div className="grid auto-rows-[minmax(180px,auto)] gap-4 md:grid-cols-2 lg:grid-cols-4">
				<BentoCard
					title="QR Codes Actifs"
					value={stats.qrActivated.value}
					change={stats.qrActivated.change}
					icon={QrCode}
					variant="highlight"
					className="md:col-span-2"
				/>

				<BentoCard
					title="Scans Totaux"
					value={stats.scans.value}
					change={stats.scans.change}
					icon={Scan}
				/>

				<BentoCard
					title="Contacts"
					value={stats.contacts.value}
					change={stats.contacts.change}
					icon={Phone}
				/>

				<ActivityChart data={activityChart} />

				<BentoCard
					title="Posts Perdus"
					value={stats.postsLost.value}
					change={stats.postsLost.change}
					icon={AlertTriangle}
				/>

				<BentoCard
					title="Posts Retrouvés"
					value={stats.postsFound.value}
					change={stats.postsFound.change}
					icon={CheckCircle2}
				/>

				<CategoryChart data={categoryChart} />

				<BentoCard
					title="Nouveaux Utilisateurs"
					value={stats.newUsers.value}
					change={stats.newUsers.change}
					icon={Users}
				/>

				<BentoCard
					title="QR Générés"
					value={stats.qrGenerated.value}
					change={stats.qrGenerated.change}
					icon={QrCode}
				/>

				<RecentActivity activities={activities} />
			</div>
		</div>
	)
}
