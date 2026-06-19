import { StatCard } from '@/shared/components/stat-card'
import { FileText, CheckCircle2, Clock, EyeOff } from 'lucide-react'

interface PostsStatsGridProps {
	total: number
	published: number
	pending: number
	hidden: number
}

export function PostsStatsGrid({
	total,
	published,
	pending,
	hidden,
}: PostsStatsGridProps) {
	return (
		<div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
			<StatCard highlight title="Total posts" value={total} icon={FileText} />
			<StatCard
				tone="success"
				title="Publiés"
				value={published}
				icon={CheckCircle2}
			/>
			<StatCard
				tone="warning"
				title="En attente"
				value={pending}
				icon={Clock}
			/>
			<StatCard tone="neutral" title="Masqués" value={hidden} icon={EyeOff} />
		</div>
	)
}
