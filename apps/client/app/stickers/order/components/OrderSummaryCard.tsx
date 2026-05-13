import { QrCode, MapPin, Tag } from 'lucide-react'

interface Pack {
	id: string
	name: string
	quantity: number
	price: number
}

interface DeliveryInfo {
	name: string
	address: string
	city: string
}

interface OrderSummaryCardProps {
	selectedPackData: Pack
	deliveryFee: number
	totalPrice: number
	formatPrice: (n: number) => string
	deliveryInfo?: DeliveryInfo
}

export function OrderSummaryCard({
	selectedPackData,
	deliveryFee,
	totalPrice,
	formatPrice,
	deliveryInfo,
}: OrderSummaryCardProps) {
	return (
		<div className="bg-background sticky top-36 rounded-2xl border p-6">
			<h3 className="mb-4 font-semibold">Récapitulatif</h3>
			<div className="space-y-4">
				<div className="flex items-center gap-3 border-b pb-4">
					<div className="bg-primary-green/10 flex h-12 w-12 items-center justify-center rounded-xl">
						<QrCode className="text-primary-green h-6 w-6" />
					</div>
					<div>
						<p className="font-medium">Pack {selectedPackData.name}</p>
						<p className="text-muted-foreground text-sm">
							{selectedPackData.quantity} stickers QR
						</p>
					</div>
				</div>

				{deliveryInfo && (
					<div className="flex items-start gap-2 text-sm">
						<MapPin className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0" />
						<div>
							<p className="font-medium">{deliveryInfo.name}</p>
							<p className="text-muted-foreground">{deliveryInfo.address}</p>
							<p className="text-muted-foreground">{deliveryInfo.city}</p>
						</div>
					</div>
				)}

				<div className="space-y-2 text-sm">
					<div className="flex justify-between">
						<span className="text-muted-foreground">Sous-total</span>
						<span>{formatPrice(selectedPackData.price)} FCFA</span>
					</div>
					<div className="flex items-center justify-between">
						<span className="text-muted-foreground">Livraison</span>
						{deliveryFee === 0 ? (
							<span className="text-primary-green flex items-center gap-1">
								<Tag className="h-3 w-3" /> Gratuite
							</span>
						) : (
							<span>{formatPrice(deliveryFee)} FCFA</span>
						)}
					</div>
				</div>

				<div className="flex justify-between border-t pt-4 text-lg font-semibold">
					<span>Total</span>
					<span>{formatPrice(totalPrice)} FCFA</span>
				</div>
			</div>
		</div>
	)
}
