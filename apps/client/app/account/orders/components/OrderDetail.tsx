'use client'

import { Button } from '@retrouve-ci/ui/components'
import Link from 'next/link'
import {
	CheckCircle2,
	Truck,
	XCircle,
	QrCode,
	MapPin,
	CreditCard,
	Calendar,
} from 'lucide-react'
import { cn } from '@retrouve-ci/ui/utils'

type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'

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

const STATUS_CONFIG: Record<
	OrderStatus,
	{ label: string; icon: React.ElementType; color: string; bgColor: string }
> = {
	pending: { label: 'En attente', icon: CheckCircle2, color: 'text-amber-600', bgColor: 'bg-amber-500/10' },
	confirmed: { label: 'Confirmée', icon: CheckCircle2, color: 'text-blue-600', bgColor: 'bg-blue-500/10' },
	shipped: { label: 'En livraison', icon: Truck, color: 'text-purple-600', bgColor: 'bg-purple-500/10' },
	delivered: { label: 'Livrée', icon: CheckCircle2, color: 'text-primary-green', bgColor: 'bg-primary-green/10' },
	cancelled: { label: 'Annulée', icon: XCircle, color: 'text-destructive', bgColor: 'bg-destructive/10' },
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

interface OrderDetailProps {
	order: Order
	onClose: () => void
}

export function OrderDetail({ order, onClose }: OrderDetailProps) {
	const statusConfig = STATUS_CONFIG[order.status]
	const StatusIcon = statusConfig.icon

	return (
		<div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
			<div
				className="absolute inset-0 bg-black/50 backdrop-blur-sm"
				onClick={onClose}
			/>
			<div className="bg-background relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-3xl shadow-2xl sm:rounded-3xl">
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

					{order.status !== 'cancelled' && (
						<div className="flex items-center justify-between">
							{['confirmed', 'shipped', 'delivered'].map((s, idx) => {
								const steps = ['confirmed', 'shipped', 'delivered']
								const currentIdx = steps.indexOf(order.status)
								const isCompleted = idx <= currentIdx
								const isCurrent = s === order.status
								return (
									<div key={s} className="flex flex-1 items-center">
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
									<p className="font-mono font-medium">{order.trackingNumber}</p>
								</div>
							</div>
						)}
					</div>

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

					<div className="flex gap-3">
						{order.status === 'delivered' && (
							<Button
								asChild
								className="bg-primary-green hover:bg-primary-green-dark h-12 flex-1 rounded-xl text-white"
							>
								<Link href="/account/stickers">Voir mes stickers</Link>
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
