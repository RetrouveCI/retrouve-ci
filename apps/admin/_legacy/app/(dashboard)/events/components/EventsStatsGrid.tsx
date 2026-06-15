import { BentoCard } from '@/components/bento-card'
import { Activity, Scan, Phone, Zap } from 'lucide-react'

interface EventsStatsGridProps {
	total: number
	scans: number
	contacts: number
	activations: number
}

export function EventsStatsGrid({
	total,
	scans,
	contacts,
	activations,
}: EventsStatsGridProps) {
	return (
		<div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
			<BentoCard
				variant="highlight"
				title="Total événements"
				value={total}
				icon={Activity}
			/>
			<BentoCard
				variant="stat"
				title="Scans"
				value={scans}
				icon={Scan}
				iconColor="text-green-600"
				iconBgColor="bg-green-100"
			/>
			<BentoCard
				variant="stat"
				title="Contacts"
				value={contacts}
				icon={Phone}
				iconColor="text-orange-600"
				iconBgColor="bg-orange-100"
			/>
			<BentoCard
				variant="stat"
				title="Activations"
				value={activations}
				icon={Zap}
				iconColor="text-blue-600"
				iconBgColor="bg-blue-100"
			/>
		</div>
	)
}
