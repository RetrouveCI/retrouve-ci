import { Button, Badge, CardContent } from '@retrouve-ci/ui/components'
import Link from 'next/link'
import { Package, Calendar, MapPin, Truck, Clock } from 'lucide-react'
import { BentoCard } from '@/components/bento-card'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

const orderStatusConfig = {
	pending: { label: 'En attente', className: 'bg-yellow-100 text-yellow-700' },
	processing: {
		label: 'En traitement',
		className: 'bg-blue-100 text-blue-700',
	},
	shipped: { label: 'Expédiée', className: 'bg-purple-100 text-purple-700' },
	delivered: { label: 'Livrée', className: 'bg-green-100 text-green-700' },
	cancelled: { label: 'Annulée', className: 'bg-red-100 text-red-700' },
}

interface Order {
	id: string
	status: keyof typeof orderStatusConfig
	quantity: number
	createdAt: string
	deliveryCity: string
	deliveryAddress: string
	trackingNumber: string | null
	deliveryNotes: string | null
}

export function OrdersTab({ orders }: { orders: Order[] }) {
	return (
		<BentoCard variant="table">
			<CardContent className="pt-6">
				{orders.length > 0 ? (
					<div className="space-y-4">
						{orders.map(order => {
							const statusInfo = orderStatusConfig[order.status]
							return (
								<div
									key={order.id}
									className="bg-card rounded-xl border p-4 transition-all hover:shadow-md"
								>
									<div className="flex flex-wrap items-start justify-between gap-4">
										<div className="space-y-1">
											<div className="flex items-center gap-2">
												<span className="font-mono font-bold">{order.id}</span>
												<Badge
													className={`${statusInfo.className} hover:${statusInfo.className}`}
												>
													{statusInfo.label}
												</Badge>
											</div>
											<div className="text-muted-foreground flex items-center gap-4 text-sm">
												<span className="flex items-center gap-1">
													<Package className="h-3.5 w-3.5" />
													{order.quantity} sticker
													{order.quantity > 1 ? 's' : ''}
												</span>
												<span className="flex items-center gap-1">
													<Calendar className="h-3.5 w-3.5" />
													{format(new Date(order.createdAt), 'dd MMM yyyy', {
														locale: fr,
													})}
												</span>
											</div>
										</div>
										<Button variant="outline" size="sm" asChild>
											<Link href="/orders">Voir détails</Link>
										</Button>
									</div>

									<div className="mt-4 grid gap-3 sm:grid-cols-2">
										<div className="bg-muted/50 flex items-start gap-2 rounded-lg p-3">
											<MapPin className="text-muted-foreground mt-0.5 h-4 w-4" />
											<div className="text-sm">
												<p className="font-medium">{order.deliveryCity}</p>
												<p className="text-muted-foreground">
													{order.deliveryAddress}
												</p>
											</div>
										</div>
										{order.trackingNumber && (
											<div className="bg-muted/50 flex items-start gap-2 rounded-lg p-3">
												<Truck className="text-muted-foreground mt-0.5 h-4 w-4" />
												<div className="text-sm">
													<p className="font-medium">Suivi</p>
													<p className="text-muted-foreground font-mono">
														{order.trackingNumber}
													</p>
												</div>
											</div>
										)}
										{order.deliveryNotes && (
											<div className="flex items-start gap-2 rounded-lg bg-orange-50 p-3 sm:col-span-2">
												<Clock className="mt-0.5 h-4 w-4 text-orange-600" />
												<div className="text-sm">
													<p className="font-medium text-orange-700">
														Note de livraison
													</p>
													<p className="text-orange-600">
														{order.deliveryNotes}
													</p>
												</div>
											</div>
										)}
									</div>
								</div>
							)
						})}
					</div>
				) : (
					<div className="flex flex-col items-center justify-center py-12 text-center">
						<div className="bg-muted rounded-full p-4">
							<Package className="text-muted-foreground h-8 w-8" />
						</div>
						<p className="mt-4 font-medium">Aucune commande</p>
						<p className="text-muted-foreground mt-1 text-sm">
							Cet utilisateur n&apos;a pas encore passé de commande de stickers
						</p>
					</div>
				)}
			</CardContent>
		</BentoCard>
	)
}
