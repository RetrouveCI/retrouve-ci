import { Button } from '@retrouve-ci/ui/components'
import { Link } from 'react-router'
import { CheckCircle2, Tag } from 'lucide-react'
import type { Order } from '../../../account/orders/orders.types'
import { PAYMENT_METHODS } from '../stickers-order.const'

interface ConfirmationStepProps {
	order: Order
	phone: string
	formatPrice: (n: number) => string
}

export function ConfirmationStep({
	order,
	phone,
	formatPrice,
}: ConfirmationStepProps) {
	const paymentMethodLabel =
		PAYMENT_METHODS.find(p => p.id === order.paymentMethod)?.name ??
		order.paymentMethod

	return (
		<div className="mx-auto max-w-lg py-12 text-center">
			<div className="bg-primary-green/10 mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full">
				<CheckCircle2 className="text-primary-green h-10 w-10" />
			</div>
			<h1 className="mb-3 text-3xl font-bold">Commande confirmée!</h1>
			<p className="text-muted-foreground mb-8">
				Merci pour votre commande. Vous recevrez vos {order.pack.quantity}{' '}
				stickers QR dans les prochains jours.
			</p>

			<div className="bg-background mb-8 rounded-2xl border p-6 text-left">
				<h3 className="mb-4 font-semibold">Détails de la commande</h3>
				<div className="space-y-3 text-sm">
					<div className="flex justify-between border-b pb-3">
						<span className="text-muted-foreground">Numéro de commande</span>
						<span className="font-mono font-medium">{order.orderNumber}</span>
					</div>
					<div className="flex justify-between">
						<span className="text-muted-foreground">Pack</span>
						<span>
							{order.pack.name} ({order.pack.quantity} stickers)
						</span>
					</div>
					<div className="flex justify-between">
						<span className="text-muted-foreground">Sous-total</span>
						<span>{formatPrice(order.pack.price)} FCFA</span>
					</div>
					<div className="flex justify-between">
						<span className="text-muted-foreground">Livraison</span>
						{order.deliveryFee === 0 ? (
							<span className="text-primary-green flex items-center gap-1">
								<Tag className="h-3 w-3" /> Gratuite (coupon)
							</span>
						) : (
							<span>{formatPrice(order.deliveryFee)} FCFA</span>
						)}
					</div>
					<div className="flex justify-between font-semibold">
						<span className="text-muted-foreground">Total payé</span>
						<span>{formatPrice(order.total)} FCFA</span>
					</div>
					<div className="flex justify-between">
						<span className="text-muted-foreground">Paiement</span>
						<span>{paymentMethodLabel}</span>
					</div>
					<div className="flex justify-between border-t pt-3">
						<span className="text-muted-foreground">Livraison</span>
						<span>{order.deliveryAddress}</span>
					</div>
				</div>
			</div>

			<div className="flex flex-col justify-center gap-3 sm:flex-row">
				<Button asChild variant="outline" className="rounded-xl">
					<Link to="/account/stickers">Mes stickers</Link>
				</Button>
				<Button
					asChild
					className="bg-primary-green hover:bg-primary-green-dark rounded-xl text-white"
				>
					<Link to="/">Retour à l&apos;accueil</Link>
				</Button>
			</div>

			<p className="text-muted-foreground mt-8 text-xs">
				Un SMS de confirmation a été envoyé au {phone}
			</p>
		</div>
	)
}
