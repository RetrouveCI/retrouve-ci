import { StatCard } from '@/shared/components/stat-card'
import { CalendarDays, CheckCircle2, FileEdit, XCircle } from 'lucide-react'
import type { Event } from '../events.types'

interface EventsStatsGridProps {
	events: Event[]
	total: number
}

export function EventsStatsGrid({ events, total }: EventsStatsGridProps) {
	const published = events.filter(e => e.status === 'published').length
	const draft = events.filter(e => e.status === 'draft').length
	const cancelled = events.filter(e => e.status === 'cancelled').length

	return (
		<div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
			<StatCard
				highlight
				title="Total événements"
				value={total}
				icon={CalendarDays}
			/>
			<StatCard
				tone="success"
				title="Publiés"
				value={published}
				icon={CheckCircle2}
			/>
			<StatCard
				tone="warning"
				title="Brouillons"
				value={draft}
				icon={FileEdit}
			/>
			<StatCard
				tone="danger"
				title="Annulés"
				value={cancelled}
				icon={XCircle}
			/>
		</div>
	)
}
