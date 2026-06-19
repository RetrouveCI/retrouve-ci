import { StatCard } from '@/shared/components/stat-card'
import { QrCode, CheckCircle, Hash } from 'lucide-react'

interface QrStatsGridProps {
	total: number
	activated: number
	revoked: number
}

export function QrStatsGrid({ total, activated, revoked }: QrStatsGridProps) {
	return (
		<div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
			<StatCard highlight title="Total générés" value={total} icon={QrCode} />
			<StatCard
				tone="success"
				title="Activés"
				value={activated}
				icon={CheckCircle}
			/>
			<StatCard
				tone="danger"
				title="Révoqués"
				value={revoked}
				icon={Hash}
				className="col-span-2 lg:col-span-1"
			/>
		</div>
	)
}
