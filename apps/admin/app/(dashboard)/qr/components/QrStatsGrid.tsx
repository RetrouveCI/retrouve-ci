import { BentoCard } from '@/components/bento-card'
import { QrCode, CheckCircle, Hash } from 'lucide-react'

interface QrStatsGridProps {
	total: number
	activated: number
	revoked: number
}

export function QrStatsGrid({ total, activated, revoked }: QrStatsGridProps) {
	return (
		<div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
			<BentoCard variant="highlight" title="Total générés" value={total} icon={QrCode} />
			<BentoCard
				variant="stat"
				title="Activés"
				value={activated}
				icon={CheckCircle}
				iconColor="text-green-600"
				iconBgColor="bg-green-100"
			/>
			<BentoCard
				variant="stat"
				title="Révoqués"
				value={revoked}
				icon={Hash}
				iconColor="text-red-500"
				iconBgColor="bg-red-100"
				className="col-span-2 lg:col-span-1"
			/>
		</div>
	)
}
