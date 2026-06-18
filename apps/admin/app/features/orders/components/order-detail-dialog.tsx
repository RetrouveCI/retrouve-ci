import {
	Button,
	Badge,
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@retrouve-ci/ui/components'
import { Package } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { StickerOrder, OrderStatus } from '../orders.types'

const STATUS_CONFIG: Record<OrderStatus, { label: string; className: string }> =
	{
		pending: {
			label: 'En attente',
			className: 'bg-yellow-50 text-yellow-700 hover:bg-yellow-50',
		},
		processing: {
			label: 'En traitement',
			className: 'bg-blue-50 text-blue-700 hover:bg-blue-50',
		},
		shipped: {
			label: 'Expédiée',
			className: 'bg-purple-50 text-purple-700 hover:bg-purple-50',
		},
		delivered: {
			label: 'Livrée',
			className: 'bg-green-50 text-green-700 hover:bg-green-50',
		},
		cancelled: {
			label: 'Annulée',
			className: 'bg-red-50 text-red-700 hover:bg-red-50',
		},
	}

interface OrderDetailDialogProps {
	order: StickerOrder | null
	open: boolean
	onOpenChange: (open: boolean) => void
}

export function OrderDetailDialog({
	order,
	open,
	onOpenChange,
}: OrderDetailDialogProps) {
	if (!order) return null
	const cfg = STATUS_CONFIG[order.status]

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-lg">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Package className="text-primary h-5 w-5" />
						Commande {order.orderNumber}
					</DialogTitle>
				</DialogHeader>
				<div className="space-y-5 py-2">
					<div className="bg-muted/50 flex items-center justify-between rounded-lg px-4 py-3">
						<span className="text-muted-foreground text-sm font-medium">
							Statut
						</span>
						<Badge className={cfg.className}>{cfg.label}</Badge>
					</div>

					<div>
						<p className="text-muted-foreground mb-2 text-xs font-semibold tracking-wider uppercase">
							Commande
						</p>
						<div className="bg-card space-y-1.5 rounded-lg border p-4">
							<p className="font-semibold">{order.packName}</p>
							<p className="text-muted-foreground text-sm">
								{order.quantity} sticker{order.quantity > 1 ? 's' : ''}
							</p>
							<p className="text-muted-foreground text-sm">
								Mode de paiement : {order.paymentMethod}
							</p>
						</div>
					</div>

					<div>
						<p className="text-muted-foreground mb-2 text-xs font-semibold tracking-wider uppercase">
							Livraison
						</p>
						<div className="bg-card space-y-1.5 rounded-lg border p-4">
							<p className="text-sm">{order.deliveryAddress}</p>
							<p className="text-muted-foreground text-sm">
								{order.deliveryCity}
							</p>
							{order.deliveryNotes && (
								<p className="bg-muted text-muted-foreground mt-2 rounded-lg px-3 py-2 text-xs italic">
									{order.deliveryNotes}
								</p>
							)}
						</div>
					</div>

					<div className="grid grid-cols-3 gap-3">
						<div className="bg-card rounded-lg border p-3 text-center">
							<p className="text-primary text-xl font-bold">{order.quantity}</p>
							<p className="text-muted-foreground text-xs">stickers</p>
						</div>
						<div className="bg-card rounded-lg border p-3 text-center">
							<p className="text-sm font-bold">{order.total} F</p>
							<p className="text-muted-foreground text-xs">Total</p>
						</div>
						<div className="bg-card rounded-lg border p-3 text-center">
							<p className="font-mono text-xs font-semibold">
								{order.trackingNumber ?? (
									<span className="text-muted-foreground">—</span>
								)}
							</p>
							<p className="text-muted-foreground text-xs">N° suivi</p>
						</div>
					</div>

					<div>
						<p className="text-muted-foreground mb-2 text-xs font-semibold tracking-wider uppercase">
							Historique
						</p>
						<div className="bg-card space-y-2 rounded-lg border p-4 text-sm">
							<div className="flex justify-between">
								<span className="text-muted-foreground">Commandé le</span>
								<span>
									{format(new Date(order.createdAt), "dd MMM yyyy 'à' HH:mm", {
										locale: fr,
									})}
								</span>
							</div>
							{order.shippedAt && (
								<div className="flex justify-between">
									<span className="text-muted-foreground">Expédié le</span>
									<span>
										{format(
											new Date(order.shippedAt),
											"dd MMM yyyy 'à' HH:mm",
											{
												locale: fr,
											},
										)}
									</span>
								</div>
							)}
							{order.deliveredAt && (
								<div className="flex justify-between">
									<span className="text-muted-foreground">Livré le</span>
									<span>
										{format(
											new Date(order.deliveredAt),
											"dd MMM yyyy 'à' HH:mm",
											{
												locale: fr,
											},
										)}
									</span>
								</div>
							)}
						</div>
					</div>
				</div>
				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Fermer
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
