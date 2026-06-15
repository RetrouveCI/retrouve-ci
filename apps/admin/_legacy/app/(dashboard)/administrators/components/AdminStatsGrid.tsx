import { BentoCard } from '@/components/bento-card'
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
			<BentoCard
				variant="highlight"
				title="Total admins"
				value={total}
				icon={Users}
			/>
			<BentoCard
				variant="stat"
				title="Actifs"
				value={active}
				icon={ShieldCheck}
				iconColor="text-green-600"
				iconBgColor="bg-green-100"
			/>
			<BentoCard
				variant="stat"
				title="Super admins"
				value={superAdmins}
				icon={Shield}
				iconColor="text-primary"
				iconBgColor="bg-primary/10"
				className="col-span-2 lg:col-span-1"
			/>
		</div>
	)
}
