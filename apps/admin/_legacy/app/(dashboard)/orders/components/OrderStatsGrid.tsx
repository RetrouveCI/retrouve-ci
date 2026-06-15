import { BentoCard } from '@/components/bento-card'
import { Package, Clock, Truck, PackageCheck } from 'lucide-react'

interface OrderStatsGridProps {
	total: number
	pending: number
	processing: number
	shipped: number
	delivered: number
}

export function OrderStatsGrid({
	total,
	pending,
	processing,
	shipped,
	delivered,
}: OrderStatsGridProps) {
	return (
		<div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
			<BentoCard
				variant="highlight"
				title="Total commandes"
				value={total}
				icon={Package}
			/>
			<BentoCard
				variant="stat"
				title="En attente"
				value={pending}
				icon={Clock}
				iconColor="text-yellow-600"
				iconBgColor="bg-yellow-100"
			/>
			<BentoCard
				variant="stat"
				title="En traitement"
				value={processing}
				icon={Package}
				iconColor="text-blue-600"
				iconBgColor="bg-blue-100"
			/>
			<BentoCard
				variant="stat"
				title="Expédiées"
				value={shipped}
				icon={Truck}
				iconColor="text-purple-600"
				iconBgColor="bg-purple-100"
			/>
			<BentoCard
				variant="stat"
				title="Livrées"
				value={delivered}
				icon={PackageCheck}
				iconColor="text-green-600"
				iconBgColor="bg-green-100"
			/>
		</div>
	)
}
