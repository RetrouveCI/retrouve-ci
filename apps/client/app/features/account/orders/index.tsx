import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import { useAuth } from '@/shared/auth/auth-context'
import { cn } from '@retrouve-ci/ui/utils'
import { OrderDetail } from '@/features/account/orders/components/order-detail'
import { EmptyOrdersState } from '@/features/account/orders/components/empty-orders-state'
import { OrderCard } from '@/features/account/orders/components/order-card'
import { NewOrderCta } from '@/features/account/orders/components/new-order-cta'
import type { Order, OrderStatus } from '@/features/account/account.types'

const mockOrders: Order[] = [
	{
		id: '1',
		orderNumber: 'CMD-2025-001847',
		date: '2025-04-20',
		pack: { name: 'Famille', quantity: 8, price: 2500 },
		deliveryFee: 0,
		total: 2500,
		status: 'delivered',
		paymentMethod: 'Orange Money',
		deliveryAddress: 'Cocody Riviera 3, Abidjan',
		trackingNumber: 'TRK789456123',
	},
	{
		id: '2',
		orderNumber: 'CMD-2025-002134',
		date: '2025-04-23',
		pack: { name: 'Starter', quantity: 4, price: 1500 },
		deliveryFee: 1000,
		total: 2500,
		status: 'shipped',
		paymentMethod: 'MTN MoMo',
		deliveryAddress: 'Plateau, Rue du Commerce, Abidjan',
		estimatedDelivery: '25 Avril 2025',
		trackingNumber: 'TRK987654321',
	},
	{
		id: '3',
		orderNumber: 'CMD-2025-002201',
		date: '2025-04-24',
		pack: { name: 'Pro', quantity: 20, price: 7000 },
		deliveryFee: 1000,
		total: 8000,
		status: 'confirmed',
		paymentMethod: 'Wave',
		deliveryAddress: 'Yopougon Sicogi, Abidjan',
		estimatedDelivery: '27 Avril 2025',
	},
]

const FILTER_OPTIONS: { value: OrderStatus | 'all'; label: string }[] = [
	{ value: 'all', label: 'Toutes' },
	{ value: 'pending', label: 'En attente' },
	{ value: 'confirmed', label: 'Confirmées' },
	{ value: 'shipped', label: 'En livraison' },
	{ value: 'delivered', label: 'Livrées' },
	{ value: 'cancelled', label: 'Annulées' },
]

export default function CommandesPage() {
	const navigate = useNavigate()
	const { isAuthenticated, isLoading } = useAuth()
	const [filter, setFilter] = useState<OrderStatus | 'all'>('all')
	const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

	useEffect(() => {
		if (!isLoading && !isAuthenticated) navigate('/auth')
	}, [isLoading, isAuthenticated, navigate])

	const orders = mockOrders
	const filteredOrders =
		filter === 'all' ? orders : orders.filter(o => o.status === filter)

	if (isLoading) {
		return (
			<main className="flex flex-1 items-center justify-center">
				<div className="border-primary-green h-10 w-10 animate-spin rounded-full border-4 border-t-transparent" />
			</main>
		)
	}

	if (!isAuthenticated) {
		return null
	}

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
