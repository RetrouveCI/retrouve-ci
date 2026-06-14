import { Button } from '@retrouve-ci/ui/components'
import { Link } from 'react-router'
import { CheckCircle2, Tag } from 'lucide-react'

interface Pack {
	id: string
	name: string
	quantity: number
	price: number
}

interface PaymentMethod {
	id: string
	name: string
}

interface FormData {
	name: string
	phone: string
	address: string
	city: string
	paymentPhone: string
}

interface ConfirmationStepProps {
	selectedPackData: Pack
	formData: FormData
	selectedPaymentData: PaymentMethod | undefined
	deliveryFee: number
	totalPrice: number
	formatPrice: (n: number) => string
}

export function ConfirmationStep({
	selectedPackData,
	formData,
	selectedPaymentData,
	deliveryFee,
	totalPrice,
	formatPrice,
}: ConfirmationStepProps) {
	return (
		<div className="mx-auto max-w-lg py-12 text-center">
			<div className="bg-primary-green/10 mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full">
				<CheckCircle2 className="text-primary-green h-10 w-10" />
			</div>
			<h1 className="mb-3 text-3xl font-bold">Commande confirmée!</h1>
			<p className="text-muted-foreground mb-8">
				Merci pour votre commande. Vous recevrez vos {selectedPackData.quantity}{' '}
				stickers QR dans les prochains jours.
			</p>

			<div className="bg-background mb-8 rounded-2xl border p-6 text-left">
				<h3 className="mb-4 font-semibold">Détails de la commande</h3>
				<div className="space-y-3 text-sm">
					<div className="flex justify-between border-b pb-3">
						<span className="text-muted-foreground">Numéro de commande</span>
						<span className="font-mono font-medium">
							RCI-{Date.now().toString().slice(-8)}
						</span>
					</div>
					<div className="flex justify-between">
						<span className="text-muted-foreground">Pack</span>
						<span>
							{selectedPackData.name} ({selectedPackData.quantity} stickers)
						</span>
					</div>
					<div className="flex justify-between">
						<span className="text-muted-foreground">Sous-total</span>
						<span>{formatPrice(selectedPackData.price)} FCFA</span>
					</div>
					<div className="flex justify-between">
						<span className="text-muted-foreground">Livraison</span>
						{deliveryFee === 0 ? (
							<span className="text-primary-green flex items-center gap-1">
								<Tag className="h-3 w-3" /> Gratuite (coupon)
							</span>
						) : (
							<span>{formatPrice(deliveryFee)} FCFA</span>
						)}
					</div>
					<div className="flex justify-between font-semibold">
						<span className="text-muted-foreground">Total payé</span>
						<span>{formatPrice(totalPrice)} FCFA</span>
					</div>
					<div className="flex justify-between">
						<span className="text-muted-foreground">Paiement</span>
						<span>{selectedPaymentData?.name}</span>
					</div>
					<div className="flex justify-between border-t pt-3">
						<span className="text-muted-foreground">Livraison</span>
						<span>
							{formData.address}, {formData.city}
						</span>
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
				Un SMS de confirmation a été envoyé au {formData.phone}
			</p>
		</div>
	)
}
