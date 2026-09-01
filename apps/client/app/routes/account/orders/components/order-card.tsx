import { Badge } from '@app/ui/components'
import { Package } from 'lucide-react'
import { cn } from '@app/ui/utils'
import { formatOrderDate, formatPrice } from '../helpers/order-progress'
import { orderStatusFor } from '../orders.const'
import type { Order } from '../types/orders.types'

/** A closed order: the one line worth keeping, and its outcome. */
export function OrderCard({ order }: { order: Order }) {
	const config = orderStatusFor(order.status)

	return (
		<article className="bg-muted/30 flex items-center gap-3 rounded-2xl border p-3.5">
			<span className="bg-muted flex h-10.5 w-10.5 shrink-0 items-center justify-center rounded-xl">
				<Package className="text-muted-foreground h-5 w-5" />
			</span>
			<div className="min-w-0 flex-1">
				<p className="text-muted-foreground truncate text-sm font-semibold">
					Pack {order.pack.name} · {order.pack.quantity} stickers
				</p>
				<p className="text-muted-foreground mt-0.5 truncate text-[11.5px]">
					{formatOrderDate(order.date)} · {formatPrice(order.total)} FCFA
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
		</article>
	)
}
