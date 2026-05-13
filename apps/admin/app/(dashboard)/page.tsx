'use client'

import { useState } from 'react'
import { TopBar } from '@/components/admin/topbar'
import { BentoCard } from '@/components/admin/bento-card'
import { DateRangePicker } from '@/components/admin/date-range-picker'
import { ActivityChart } from '@/app/(dashboard)/components/activity-chart'
import { CategoryChart } from '@/app/(dashboard)/components/category-chart'
import { RecentActivity } from '@/app/(dashboard)/components/recent-activity'
import { useDashboard } from '@/application/dashboard/use-dashboard'
import { useRecentActivities } from '@/application/events/use-events'
import type { DateRange } from 'react-day-picker'
import {
	QrCode,
	CheckCircle2,
	Scan,
	Phone,
	AlertTriangle,
	Users,
} from 'lucide-react'

export default function DashboardPage() {
	const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
	const { stats, chartData } = useDashboard()
	const { activities } = useRecentActivities(6)

	return (
		<>
			<TopBar title="Dashboard" />
			<div className="pt-16">
				<div className="p-4 lg:p-6">
					<div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
						<div>
							<h1 className="text-foreground text-2xl font-bold lg:text-3xl">
								Bienvenue sur RetrouveCI
							</h1>
							<p className="text-muted-foreground mt-1">
								Voici un aperçu de votre plateforme
							</p>
						</div>
						<DateRangePicker
							dateRange={dateRange}
							onDateRangeChange={setDateRange}
						/>
					</div>

					<div className="grid auto-rows-[minmax(180px,auto)] gap-4 md:grid-cols-2 lg:grid-cols-4">
						<BentoCard
							title="QR Codes Actifs"
							value={stats?.qrActivated.value}
							change={stats?.qrActivated.change}
							icon={QrCode}
							variant="highlight"
							className="md:col-span-2"
						/>

						<BentoCard
							title="Scans Totaux"
							value={stats?.scans.value}
							change={stats?.scans.change}
							icon={Scan}
							iconColor="text-purple-600"
							iconBgColor="bg-purple-100"
						/>

						<BentoCard
							title="Contacts"
							value={stats?.contacts.value}
							change={stats?.contacts.change}
							icon={Phone}
							iconColor="text-orange-600"
							iconBgColor="bg-orange-100"
						/>

						<ActivityChart data={chartData?.activity} />

						<BentoCard
							title="Posts Perdus"
							value={stats?.postsLost.value}
							change={stats?.postsLost.change}
							icon={AlertTriangle}
							iconColor="text-red-600"
							iconBgColor="bg-red-100"
						/>

						<BentoCard
							title="Posts Retrouvés"
							value={stats?.postsFound.value}
							change={stats?.postsFound.change}
							icon={CheckCircle2}
							iconColor="text-emerald-600"
							iconBgColor="bg-emerald-100"
						/>

						<CategoryChart data={chartData?.postsByCategory} />

						<BentoCard
							title="Nouveaux Utilisateurs"
							value={stats?.newUsers.value}
							change={stats?.newUsers.change}
							icon={Users}
							iconColor="text-blue-600"
							iconBgColor="bg-blue-100"
						/>

						<BentoCard
							title="QR Générés"
							value={stats?.qrGenerated.value}
							change={stats?.qrGenerated.change}
							icon={QrCode}
							iconColor="text-indigo-600"
							iconBgColor="bg-indigo-100"
						/>

						<RecentActivity activities={activities} />
					</div>
				</div>
			</div>
		</>
	)
}
