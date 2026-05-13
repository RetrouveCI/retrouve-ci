import { BentoCard } from '@/components/bento-card'
import { FileText, CheckCircle2, Clock, AlertTriangle } from 'lucide-react'

interface PostsStatsGridProps {
	total: number
	published: number
	pending: number
	lost: number
}

export function PostsStatsGrid({ total, published, pending, lost }: PostsStatsGridProps) {
	return (
		<div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
			<BentoCard variant="highlight" title="Total posts" value={total} icon={FileText} />
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
				title="En attente"
				value={pending}
				icon={Clock}
				iconColor="text-orange-600"
				iconBgColor="bg-orange-100"
			/>
			<BentoCard
				variant="stat"
				title="Perdus signalés"
				value={lost}
				icon={AlertTriangle}
				iconColor="text-red-500"
				iconBgColor="bg-red-100"
			/>
		</div>
	)
}
