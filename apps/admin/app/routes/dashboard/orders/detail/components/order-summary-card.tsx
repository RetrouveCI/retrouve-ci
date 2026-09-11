import { Card, CardContent, CardHeader, CardTitle } from '@app/ui/components'
import { cn } from '@app/ui/utils'
import {
	formatPrice,
	stickerPaymentMethodLabel,
} from '@app/contracts/sticker-orders'
import { ORDER_SOURCE_LABELS } from '../../orders.const'
import type { StickerOrder } from '../../types/orders.types'

export function OrderSummaryCard({ order }: { order: StickerOrder }) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Contenu</CardTitle>
			</CardHeader>
			<CardContent className="space-y-2.5 text-sm">
				<div className="border-b pb-3">
					<p className="font-semibold">{order.packName}</p>
					<p className="text-muted-foreground text-xs">
						{order.quantity} sticker{order.quantity > 1 ? 's' : ''} QR
					</p>
				</div>
				<SummaryRow
					label="Livraison"
					value={order.deliveryFee ? formatPrice(order.deliveryFee) : 'Offerte'}
				/>
				{/* Paid to the courier: this is the cash the parcel leaves with. */}
				<SummaryRow
					label="À encaisser à la livraison"
					value={formatPrice(order.total)}
					strong
				/>
				<SummaryRow
					label="Mode de paiement"
					value={stickerPaymentMethodLabel(order.paymentMethod)}
				/>
				<SummaryRow label="Source" value={ORDER_SOURCE_LABELS[order.source]} />
			</CardContent>
		</Card>
	)
}

function SummaryRow({
	label,
	value,
	strong = false,
}: {
	label: string
	value: string
	strong?: boolean
}) {
	return (
		<div className="flex items-baseline justify-between gap-4">
			<span className="text-muted-foreground">{label}</span>
			<span className={cn('text-right', strong && 'font-mono font-semibold')}>
				{value}
			</span>
		</div>
	)
}
