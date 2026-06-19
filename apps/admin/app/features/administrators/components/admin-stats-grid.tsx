import { StatCard } from '@/shared/components/stat-card'
import { Users, ShieldCheck, Shield } from 'lucide-react'

interface AdminStatsGridProps {
	total: number
	active: number
	superAdmins: number
}

export function AdminStatsGrid({
	total,
	active,
	superAdmins,
}: AdminStatsGridProps) {
	return (
		<div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
			<StatCard highlight title="Total admins" value={total} icon={Users} />
			<StatCard
				tone="success"
				title="Actifs"
				value={active}
				icon={ShieldCheck}
			/>
			<StatCard
				tone="primary"
				title="Super admins"
				value={superAdmins}
				icon={Shield}
				className="col-span-2 lg:col-span-1"
			/>
		</div>
	)
}
