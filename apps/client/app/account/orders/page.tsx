'use client'

import { Button } from '@retrouve-ci/ui/components'
import Link from 'next/link'
import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { useAuth } from '@/contexts/auth-context'
import { cn } from '@retrouve-ci/ui/utils'
import { OrderDetail } from './components/OrderDetail'
import { EmptyOrdersState } from './components/EmptyOrdersState'
import { OrderCard } from './components/OrderCard'
import { NewOrderCta } from './components/NewOrderCta'

type OrderStatus =
	| 'pending'
	| 'confirmed'
	| 'shipped'
	| 'delivered'
	| 'cancelled'

interface Order {
	id: string
	orderNumber: string
	date: string
	pack: { name: string; quantity: number; price: number }
	deliveryFee: number
	total: number
	status: OrderStatus
	paymentMethod: string
	deliveryAddress: string
	estimatedDelivery?: string
	trackingNumber?: string
}

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
	const { isAuthenticated, isLoading } = useAuth()
	const [filter, setFilter] = useState<OrderStatus | 'all'>('all')
	const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

	const orders = mockOrders
	const filteredOrders =
		filter === 'all' ? orders : orders.filter(o => o.status === filter)

	if (isLoading) {
		return (
			<>
				<Header />
				<main className="flex flex-1 items-center justify-center">
					<div className="border-primary-green h-10 w-10 animate-spin rounded-full border-4 border-t-transparent" />
				</main>
				<Footer />
			</>
		)
	}

	if (!isAuthenticated) {
		return (
			<>
				<Header />
				<main className="flex flex-1 items-center justify-center py-16">
					<div className="text-center">
						<p className="text-muted-foreground mb-4">
							Connectez-vous pour voir vos commandes.
						</p>
						<Button
							asChild
							className="bg-primary-green hover:bg-primary-green-dark text-white"
						>
							<Link href="/auth/login">Se connecter</Link>
						</Button>
					</div>
				</main>
				<Footer />
			</>
		)
	}

	return (
		<>
			<Header />
			<main className="flex-1">
				<section className="border-b">
					<div className="container mx-auto px-4 py-6">
						<div className="mb-4 flex items-center gap-4">
							<Link
								href="/account"
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
			<Footer />

			{selectedOrder && (
				<OrderDetail
					order={selectedOrder}
					onClose={() => setSelectedOrder(null)}
				/>
			)}
		</>
	)
}
