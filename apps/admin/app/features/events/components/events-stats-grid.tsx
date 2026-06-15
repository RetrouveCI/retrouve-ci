import { BentoCard } from '@/shared/components/bento-card'
import { CalendarDays, CheckCircle2, FileEdit, XCircle } from 'lucide-react'
import type { Event } from '../events.types'

interface EventsStatsGridProps {
	events: Event[]
	total: number
}

export function EventsStatsGrid({ events, total }: EventsStatsGridProps) {
	const published = events.filter((e) => e.status === 'published').length
	const draft = events.filter((e) => e.status === 'draft').length
	const cancelled = events.filter((e) => e.status === 'cancelled').length

	return (
		<div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
			<BentoCard
				variant="highlight"
				title="Total événements"
				value={total}
				icon={CalendarDays}
			/>
			<BentoCard
				variant="stat"
				title="Publiés"
				value={published}
				icon={CheckCircle2}
				iconColor="text-green-600"
				iconBgColor="bg-green-100"
			/>
			<BentoCard
				variant="stat"
				title="Brouillons"
				value={draft}
				icon={FileEdit}
				iconColor="text-yellow-600"
				iconBgColor="bg-yellow-100"
			/>
			<BentoCard
				variant="stat"
				title="Annulés"
				value={cancelled}
				icon={XCircle}
				iconColor="text-red-600"
				iconBgColor="bg-red-100"
			/>
		</div>
	)
}
