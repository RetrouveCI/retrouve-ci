import { StatCard } from '@/shared/components/stat-card'
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
			<StatCard
				highlight
				title="Total utilisateurs"
				value={total}
				icon={Users}
			/>
			<StatCard tone="success" title="Actifs" value={active} icon={UserCheck} />
			<StatCard
				tone="neutral"
				title="Inactifs"
				value={inactive}
				icon={UserX}
				className="col-span-2 lg:col-span-1"
			/>
		</div>
	)
}
