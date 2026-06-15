import { useState } from 'react'
import { Link } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@retrouve-ci/ui/utils'
import { OrderDetail } from './components/order-detail'
import { EmptyOrdersState } from './components/empty-orders-state'
import { OrderCard } from './components/order-card'
import { NewOrderCta } from './components/new-order-cta'
import type { Order, OrderStatus } from './orders.types'
import { ordersLoader } from './servers/orders.loader'
import type { Route } from './+types/index'

export const loader = ordersLoader

const FILTER_OPTIONS: { value: OrderStatus | 'all'; label: string }[] = [
	{ value: 'all', label: 'Toutes' },
	{ value: 'pending', label: 'En attente' },
	{ value: 'processing', label: 'En préparation' },
	{ value: 'shipped', label: 'En livraison' },
	{ value: 'delivered', label: 'Livrées' },
	{ value: 'cancelled', label: 'Annulées' },
]

export default function CommandesPage({ loaderData }: Route.ComponentProps) {
	const { orders } = loaderData
	const [filter, setFilter] = useState<OrderStatus | 'all'>('all')
	const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

	const filteredOrders =
		filter === 'all' ? orders : orders.filter(o => o.status === filter)

	return (
		<>
			<main className="flex-1">
				<section className="border-b">
					<div className="container mx-auto px-4 py-6">
						<div className="mb-4 flex items-center gap-4">
							<Link
								to="/account"
								className="hover:bg-muted flex h-10 w-10 items-center justify-center rounded-xl border transition-colors"
							>
								<ArrowLeft className="h-5 w-5" />
							</Link>
							<div>
								<h1 className="text-2xl font-bold">Mes Commandes</h1>
								<p className="text-muted-foreground text-sm">
									{orders.length} commande{orders.length > 1 ? 's' : ''} au
									total
								</p>
							</div>
						</div>

						<div className="scrollbar-hide flex gap-2 overflow-x-auto pb-1">
							{FILTER_OPTIONS.map(option => (
								<button
									key={option.value}
									onClick={() => setFilter(option.value)}
									className={cn(
										'rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-all',
										filter === option.value
											? 'bg-foreground text-background'
											: 'bg-muted text-muted-foreground hover:bg-muted/80',
									)}
								>
									{option.label}
								</button>
							))}
						</div>
					</div>
				</section>

				<section className="py-6">
					<div className="container mx-auto px-4">
						{filteredOrders.length === 0 ? (
							<EmptyOrdersState />
						) : (
							<div className="space-y-3">
								{filteredOrders.map(order => (
									<OrderCard
										key={order.id}
										order={order}
										onClick={() => setSelectedOrder(order)}
									/>
								))}
							</div>
						)}

						<NewOrderCta />
					</div>
				</section>
			</main>

			{selectedOrder && (
				<OrderDetail
					order={selectedOrder}
					onClose={() => setSelectedOrder(null)}
				/>
			)}
		</>
	)
}
