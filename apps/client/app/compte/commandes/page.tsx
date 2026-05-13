'use client'

import { Button } from '@retrouve-ci/ui/components'
import Link from 'next/link'
import { useState } from 'react'
import {
	ArrowLeft,
	Package,
	Clock,
	CheckCircle2,
	Truck,
	XCircle,
	ChevronRight,
	QrCode,
	MapPin,
	CreditCard,
	Calendar,
	Plus,
} from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { useAuth } from '@/contexts/auth-context'
import { cn } from '@retrouve-ci/ui/utils'

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
	pack: {
		name: string
		quantity: number
		price: number
	}
	deliveryFee: number
	total: number
	status: OrderStatus
	paymentMethod: string
	deliveryAddress: string
	estimatedDelivery?: string
	trackingNumber?: string
}

// Mock orders data
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

const FILTER_OPTIONS: { value: OrderStatus | 'all'; label: string }[] = [
	{ value: 'all', label: 'Toutes' },
	{ value: 'pending', label: 'En attente' },
	{ value: 'confirmed', label: 'Confirmées' },
	{ value: 'shipped', label: 'En livraison' },
	{ value: 'delivered', label: 'Livrées' },
	{ value: 'cancelled', label: 'Annulées' },
]

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

// Order detail modal/drawer
function OrderDetail({
	order,
	onClose,
}: {
	order: Order
	onClose: () => void
}) {
	const statusConfig = STATUS_CONFIG[order.status]
	const StatusIcon = statusConfig.icon

	return (
		<div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
			<div
				className="absolute inset-0 bg-black/50 backdrop-blur-sm"
				onClick={onClose}
			/>
			<div className="bg-background relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-3xl shadow-2xl sm:rounded-3xl">
				{/* Header */}
				<div className="bg-background sticky top-0 flex items-center justify-between border-b p-4">
					<div>
						<p className="text-muted-foreground text-xs">Commande</p>
						<p className="font-bold">{order.orderNumber}</p>
					</div>
					<Button
						variant="ghost"
						size="icon"
						onClick={onClose}
						className="rounded-full"
					>
						<XCircle className="h-5 w-5" />
					</Button>
				</div>

				<div className="space-y-6 p-5">
					{/* Status */}
					<div
						className={cn(
							'flex items-center gap-3 rounded-2xl p-4',
							statusConfig.bgColor,
						)}
					>
						<StatusIcon className={cn('h-6 w-6', statusConfig.color)} />
						<div>
							<p className={cn('font-semibold', statusConfig.color)}>
								{statusConfig.label}
							</p>
							{order.estimatedDelivery && order.status !== 'delivered' && (
								<p className="text-muted-foreground text-sm">
									Livraison estimée : {order.estimatedDelivery}
								</p>
							)}
						</div>
					</div>

					{/* Progress tracker */}
					{order.status !== 'cancelled' && (
						<div className="flex items-center justify-between">
							{['confirmed', 'shipped', 'delivered'].map((step, idx) => {
								const steps = ['confirmed', 'shipped', 'delivered']
								const currentIdx = steps.indexOf(order.status)
								const isCompleted = idx <= currentIdx
								const isCurrent = step === order.status
								return (
									<div key={step} className="flex flex-1 items-center">
										<div
											className={cn(
												'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all',
												isCompleted
													? 'bg-primary-green text-white'
													: 'bg-muted text-muted-foreground',
												isCurrent && 'ring-primary-green/20 ring-4',
											)}
										>
											{isCompleted ? (
												<CheckCircle2 className="h-4 w-4" />
											) : (
												idx + 1
											)}
										</div>
										{idx < 2 && (
											<div
												className={cn(
													'mx-1 h-1 flex-1 rounded-full',
													idx < currentIdx ? 'bg-primary-green' : 'bg-muted',
												)}
											/>
										)}
									</div>
								)
							})}
						</div>
					)}

					{/* Pack info */}
					<div className="rounded-2xl border p-4">
						<div className="flex items-center gap-4">
							<div className="bg-primary-green/10 flex h-14 w-14 items-center justify-center rounded-xl">
								<QrCode className="text-primary-green h-7 w-7" />
							</div>
							<div className="flex-1">
								<p className="font-semibold">Pack {order.pack.name}</p>
								<p className="text-muted-foreground text-sm">
									{order.pack.quantity} stickers QR
								</p>
							</div>
							<p className="font-bold">{formatPrice(order.pack.price)} FCFA</p>
						</div>
					</div>

					{/* Details */}
					<div className="space-y-3 text-sm">
						<div className="flex items-start gap-3 border-b py-2">
							<Calendar className="text-muted-foreground mt-0.5 h-4 w-4" />
							<div className="flex-1">
								<p className="text-muted-foreground">Date de commande</p>
								<p className="font-medium">{formatDate(order.date)}</p>
							</div>
						</div>
						<div className="flex items-start gap-3 border-b py-2">
							<MapPin className="text-muted-foreground mt-0.5 h-4 w-4" />
							<div className="flex-1">
								<p className="text-muted-foreground">Adresse de livraison</p>
								<p className="font-medium">{order.deliveryAddress}</p>
							</div>
						</div>
						<div className="flex items-start gap-3 border-b py-2">
							<CreditCard className="text-muted-foreground mt-0.5 h-4 w-4" />
							<div className="flex-1">
								<p className="text-muted-foreground">Mode de paiement</p>
								<p className="font-medium">{order.paymentMethod}</p>
							</div>
						</div>
						{order.trackingNumber && (
							<div className="flex items-start gap-3 border-b py-2">
								<Truck className="text-muted-foreground mt-0.5 h-4 w-4" />
								<div className="flex-1">
									<p className="text-muted-foreground">Numéro de suivi</p>
									<p className="font-mono font-medium">
										{order.trackingNumber}
									</p>
								</div>
							</div>
						)}
					</div>

					{/* Totals */}
					<div className="bg-muted/50 space-y-2 rounded-2xl p-4">
						<div className="flex justify-between text-sm">
							<span className="text-muted-foreground">Sous-total</span>
							<span>{formatPrice(order.pack.price)} FCFA</span>
						</div>
						<div className="flex justify-between text-sm">
							<span className="text-muted-foreground">Livraison</span>
							{order.deliveryFee === 0 ? (
								<span className="text-primary-green">Gratuite</span>
							) : (
								<span>{formatPrice(order.deliveryFee)} FCFA</span>
							)}
						</div>
						<div className="flex justify-between border-t pt-2 text-lg font-bold">
							<span>Total</span>
							<span>{formatPrice(order.total)} FCFA</span>
						</div>
					</div>

					{/* Actions */}
					<div className="flex gap-3">
						{order.status === 'delivered' && (
							<Button
								asChild
								className="bg-primary-green hover:bg-primary-green-dark h-12 flex-1 rounded-xl text-white"
							>
								<Link href="/compte/stickers">Voir mes stickers</Link>
							</Button>
						)}
						{(order.status === 'pending' || order.status === 'confirmed') && (
							<Button
								variant="outline"
								className="text-destructive border-destructive/20 hover:bg-destructive/10 h-12 flex-1 rounded-xl"
							>
								Annuler la commande
							</Button>
						)}
						<Button
							variant="outline"
							className="h-12 flex-1 rounded-xl"
							onClick={onClose}
						>
							Fermer
						</Button>
					</div>
				</div>
			</div>
		</div>
	)
}

// Empty state
function EmptyState() {
	return (
		<div className="py-16 text-center">
			<div className="bg-muted mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl">
				<Package className="text-muted-foreground h-8 w-8" />
			</div>
			<h3 className="mb-2 text-lg font-semibold">Aucune commande</h3>
			<p className="text-muted-foreground mx-auto mb-6 max-w-sm">
				Vous n&apos;avez pas encore passé de commande de stickers QR.
			</p>
			<Button
				asChild
				className="bg-primary-green hover:bg-primary-green-dark h-11 rounded-xl text-white"
			>
				<Link href="/stickers/commander" className="gap-2">
					<Plus className="h-4 w-4" />
					Commander des stickers
				</Link>
			</Button>
		</div>
	)
}

export default function CommandesPage() {
	const { isAuthenticated, isLoading } = useAuth()
	const [filter, setFilter] = useState<OrderStatus | 'all'>('all')
	const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

	// In real app, orders would come from useAuth() or API
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
							<Link href="/auth">Se connecter</Link>
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
				{/* Header */}
				<section className="border-b">
					<div className="container mx-auto px-4 py-6">
						<div className="mb-4 flex items-center gap-4">
							<Link
								href="/compte"
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

						{/* Filter chips */}
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

				{/* Orders list */}
				<section className="py-6">
					<div className="container mx-auto px-4">
						{filteredOrders.length === 0 ? (
							<EmptyState />
						) : (
							<div className="space-y-3">
								{filteredOrders.map(order => {
									const statusConfig = STATUS_CONFIG[order.status]
									const StatusIcon = statusConfig.icon
									return (
										<button
											key={order.id}
											onClick={() => setSelectedOrder(order)}
											className="group bg-background hover:border-primary-green/30 w-full rounded-2xl border p-4 text-left transition-all hover:shadow-md"
										>
											<div className="flex items-start gap-4">
												{/* Icon */}
												<div className="bg-primary-green/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-110">
													<QrCode className="text-primary-green h-6 w-6" />
												</div>

												{/* Content */}
												<div className="min-w-0 flex-1">
													<div className="mb-1 flex items-start justify-between gap-2">
														<p className="truncate font-semibold">
															Pack {order.pack.name}
														</p>
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
														{order.pack.quantity} stickers &middot;{' '}
														{order.orderNumber}
													</p>
													<div className="flex items-center justify-between">
														<p className="text-muted-foreground text-xs">
															{formatDate(order.date)}
														</p>
														<p className="text-sm font-bold">
															{formatPrice(order.total)} FCFA
														</p>
													</div>
												</div>

												{/* Chevron */}
												<ChevronRight className="text-muted-foreground mt-3 h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1" />
											</div>
										</button>
									)
								})}
							</div>
						)}

						{/* CTA */}
						<div className="mt-8">
							<Link
								href="/stickers/commander"
								className="group border-primary-green/30 bg-primary-green/5 hover:border-primary-green/50 hover:bg-primary-green/10 flex items-center justify-between gap-4 rounded-2xl border-2 border-dashed p-5 transition-all"
							>
								<div className="flex items-center gap-4">
									<div className="bg-primary-green flex h-11 w-11 items-center justify-center rounded-xl transition-transform group-hover:scale-110">
										<Plus className="h-5 w-5 text-white" />
									</div>
									<div>
										<p className="font-semibold">Nouvelle commande</p>
										<p className="text-muted-foreground text-sm">
											Commander des stickers QR
										</p>
									</div>
								</div>
								<ChevronRight className="text-muted-foreground h-5 w-5 transition-transform group-hover:translate-x-1" />
							</Link>
						</div>
					</div>
				</section>
			</main>
			<Footer />

			{/* Order detail modal */}
			{selectedOrder && (
				<OrderDetail
					order={selectedOrder}
					onClose={() => setSelectedOrder(null)}
				/>
			)}
		</>
	)
}
