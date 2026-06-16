import { BentoCard } from '@/shared/components/bento-card'
import { Users, UserCheck, UserX } from 'lucide-react'

interface UsersStatsGridProps {
	total: number
	active: number
	inactive: number
}

export function UsersStatsGrid({
	total,
	active,
	inactive,
}: UsersStatsGridProps) {
	return (
		<div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
			<BentoCard
				variant="highlight"
				title="Total utilisateurs"
				value={total}
				icon={Users}
			/>
			<BentoCard
				variant="stat"
				title="Actifs"
				value={active}
				icon={UserCheck}
				iconColor="text-green-600"
				iconBgColor="bg-green-100"
			/>
			<BentoCard
				variant="stat"
				title="Inactifs"
				value={inactive}
				icon={UserX}
				iconColor="text-gray-500"
				iconBgColor="bg-gray-100"
				className="col-span-2 lg:col-span-1"
			/>
		</div>
	)
}
