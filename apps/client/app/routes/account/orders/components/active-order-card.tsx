import { Badge, Button } from '@app/ui/components'
import { Link } from 'react-router'
import { MapPin, Phone } from 'lucide-react'
import { cn } from '@app/ui/utils'
import { stickerPaymentMethodLabel } from '@app/contracts/sticker-orders'
import {
	buildOrderProgress,
	formatOrderDate,
	formatPrice,
} from '../helpers/order-progress'
import { orderStatusFor } from '../orders.const'
import { OrderProgressRail } from './order-progress-rail'
import type { Order } from '../types/orders.types'

/**
 * The order still on its way, opened rather than folded: what one comes here
 * for is where it is and what to hand the courier, and neither is worth a tap.
 */
export function ActiveOrderCard({ order }: { order: Order }) {
	const config = orderStatusFor(order.status)

	return (
		<article className="border-primary-green/25 bg-background overflow-hidden rounded-2xl border">
			<div className="flex flex-col gap-4 p-4">
				<div className="flex items-start justify-between gap-3">
					<div className="min-w-0">
						<h2 className="truncate text-[15.5px] font-bold">
							Pack {order.pack.name} · {order.pack.quantity} stickers
						</h2>
						<p className="text-muted-foreground mt-0.5 truncate text-[12.5px]">
							Commande n° {order.orderNumber} · {formatOrderDate(order.date)}
						</p>
					</div>
					<Badge
						className={cn(
							'h-5.5 shrink-0 text-[10px] font-bold tracking-[0.04em] uppercase',
							config.badge,
						)}
					>
						{config.label}
					</Badge>
				</div>

				<OrderProgressRail steps={buildOrderProgress(order.status)} />

				<div className="bg-muted/40 flex items-start gap-2.5 rounded-xl border p-3">
					<MapPin className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0" />
					<div className="min-w-0">
						<p className="text-[12.5px] font-semibold">
							{order.deliveryAddress}
						</p>
						{order.deliveryNotes && (
							<p className="text-muted-foreground mt-0.5 text-[11.5px]">
								{order.deliveryNotes}
							</p>
						)}
					</div>
				</div>
			</div>

			<div className="bg-muted/40 flex items-center justify-between gap-3 border-t p-4">
				<div>
					{/* An order predating cash-on-delivery still names what paid it. */}
					<p className="text-muted-foreground text-[11.5px]">
						{stickerPaymentMethodLabel(order.paymentMethod)}
					</p>
					{/* No `tracking-tight` here: it crushes the narrow no-break space
					    `Intl` puts between the thousands, and « 4 500 » reads « 4500 ». */}
					<p className="text-[17px] font-bold">
						{formatPrice(order.total)} FCFA
					</p>
				</div>
				<Button
					asChild
					variant="outline"
					className="touch-target h-10 shrink-0 gap-2 rounded-xl text-[13.5px]"
				>
					<Link to="/contact">
						<Phone className="h-3.5 w-3.5" />
						Nous joindre
					</Link>
				</Button>
			</div>
		</article>
	)
}
