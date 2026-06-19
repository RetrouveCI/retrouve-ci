import { StatCard } from '@/shared/components/stat-card'
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
			<StatCard
				highlight
				title="Total commandes"
				value={total}
				icon={Package}
			/>
			<StatCard
				tone="warning"
				title="En attente"
				value={pending}
				icon={Clock}
			/>
			<StatCard
				tone="info"
				title="En traitement"
				value={processing}
				icon={Package}
			/>
			<StatCard tone="purple" title="Expédiées" value={shipped} icon={Truck} />
			<StatCard
				tone="success"
				title="Livrées"
				value={delivered}
				icon={PackageCheck}
			/>
		</div>
	)
}
