import { Link } from 'react-router'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { AlertTriangle } from 'lucide-react'
import { Badge, Button } from '@app/ui/components'
import { stickerPaymentMethodLabel } from '@app/contracts/sticker-orders'
import type { RouteHandle } from '@/shared/helpers/page-meta'
import { ORDER_STATUS_CONFIG } from '../orders.const'
import { ordersAction } from '../servers/orders.action'
import { OrderDeliveryCard } from './components/order-delivery-card'
import { OrderStatusCard } from './components/order-status-card'
import { OrderSummaryCard } from './components/order-summary-card'
import { OrderTimeline } from './components/order-timeline'
import { orderLoader } from './servers/order.loader'
import type { Route } from './+types/_index'

export const loader = orderLoader
// The list's own action: it reads the order's id from the form.
export const action = ordersAction

export const handle: RouteHandle = {
	title: data => {
		const order = (data as Route.ComponentProps['loaderData'] | undefined)
			?.order
		return order ? `Commande ${order.orderNumber}` : 'Commande'
	},
	breadcrumb: [{ label: 'Commandes', to: '/orders' }],
}

export default function OrderDetailPage({ loaderData }: Route.ComponentProps) {
	const { order } = loaderData
	const status = ORDER_STATUS_CONFIG[order.status]

	return (
		<div className="space-y-4 p-4 lg:p-6">
			<div className="flex flex-wrap items-center gap-2 text-sm">
				<Badge className={status.className}>{status.label}</Badge>
				<Badge variant="outline">
					{stickerPaymentMethodLabel(order.paymentMethod)}
				</Badge>
				<span className="text-muted-foreground">
					Passée le{' '}
					{format(new Date(order.createdAt), "d MMM yyyy 'à' HH:mm", {
						locale: fr,
					})}
				</span>
			</div>

			<div className="grid gap-4 lg:grid-cols-3">
				<div className="space-y-4 lg:col-span-2">
					<OrderSummaryCard order={order} />
					<OrderDeliveryCard order={order} />
					<OrderTimeline order={order} />
				</div>
				<div className="space-y-4">
					<OrderStatusCard order={order} />
				</div>
			</div>
		</div>
	)
}

export function ErrorBoundary() {
	return (
		<div className="flex flex-col items-center justify-center p-12 text-center">
			<AlertTriangle className="text-muted-foreground h-12 w-12" />
			<h2 className="mt-4 text-xl font-semibold">Commande introuvable</h2>
			<p className="text-muted-foreground mt-2">
				Cette commande n’existe pas, ou l’API ne répond pas.
			</p>
			<Button asChild className="mt-4">
				<Link to="/orders">Retour aux commandes</Link>
			</Button>
		</div>
	)
}
