import {
	Clock,
	CheckCircle2,
	Truck,
	XCircle,
	QrCode,
	ChevronRight,
} from 'lucide-react'
import { cn } from '@retrouve-ci/ui/utils'
import type { Order, OrderStatus } from '../../account.types'

const STATUS_CONFIG: Record<
	OrderStatus,
	{ label: string; icon: React.ElementType; color: string; bgColor: string }
> = {
	pending: {
		label: 'En attente',
		icon: Clock,
		color: 'text-amber-600',
		bgColor: 'bg-amber-500/10',
	},
	confirmed: {
		label: 'Confirmée',
		icon: CheckCircle2,
		color: 'text-blue-600',
		bgColor: 'bg-blue-500/10',
	},
	shipped: {
		label: 'En livraison',
		icon: Truck,
		color: 'text-purple-600',
		bgColor: 'bg-purple-500/10',
	},
	delivered: {
		label: 'Livrée',
		icon: CheckCircle2,
		color: 'text-primary-green',
		bgColor: 'bg-primary-green/10',
	},
	cancelled: {
		label: 'Annulée',
		icon: XCircle,
		color: 'text-destructive',
		bgColor: 'bg-destructive/10',
	},
}

function formatPrice(price: number) {
	return new Intl.NumberFormat('fr-FR').format(price)
}

function formatDate(dateString: string) {
	return new Date(dateString).toLocaleDateString('fr-FR', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	})
}

interface OrderCardProps {
	order: Order
	onClick: () => void
}

export function OrderCard({ order, onClick }: OrderCardProps) {
	const statusConfig = STATUS_CONFIG[order.status]
	const StatusIcon = statusConfig.icon

	return (
		<button
			onClick={onClick}
			className="group bg-background hover:border-primary-green/30 w-full rounded-2xl border p-4 text-left transition-all hover:shadow-md"
		>
			<div className="flex items-start gap-4">
				<div className="bg-primary-green/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-110">
					<QrCode className="text-primary-green h-6 w-6" />
				</div>

				<div className="min-w-0 flex-1">
					<div className="mb-1 flex items-start justify-between gap-2">
						<p className="truncate font-semibold">Pack {order.pack.name}</p>
						<span
							className={cn(
								'inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
								statusConfig.bgColor,
								statusConfig.color,
							)}
						>
							<StatusIcon className="h-3 w-3" />
							{statusConfig.label}
						</span>
					</div>
					<p className="text-muted-foreground mb-2 text-sm">
						{order.pack.quantity} stickers &middot; {order.orderNumber}
					</p>
					<div className="flex items-center justify-between">
						<p className="text-muted-foreground text-xs">
							{formatDate(order.date)}
						</p>
						<p className="text-sm font-bold">{formatPrice(order.total)} FCFA</p>
					</div>
				</div>

				<ChevronRight className="text-muted-foreground mt-3 h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1" />
			</div>
		</button>
	)
}
