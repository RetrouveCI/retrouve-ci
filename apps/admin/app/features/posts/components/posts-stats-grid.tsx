import { BentoCard } from '@/shared/components/bento-card'
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
			<BentoCard
				variant="highlight"
				title="Total posts"
				value={total}
				icon={FileText}
			/>
			<BentoCard
				variant="stat"
				title="Publiés"
				value={published}
				icon={CheckCircle2}
				iconColor="text-green-600"
				iconBgColor="bg-green-50"
			/>
			<BentoCard
				variant="stat"
				title="En attente"
				value={pending}
				icon={Clock}
				iconColor="text-orange-600"
				iconBgColor="bg-orange-50"
			/>
			<BentoCard
				variant="stat"
				title="Masqués"
				value={hidden}
				icon={EyeOff}
				iconColor="text-gray-600"
				iconBgColor="bg-gray-50"
			/>
		</div>
	)
}
