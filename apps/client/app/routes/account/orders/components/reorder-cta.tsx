import { Link } from 'react-router'
import { ChevronRight, Plus } from 'lucide-react'
import type { Order } from '../types/orders.types'

/**
 * « Même pack, même adresse » in the artboard: the funnel prefills the pack
 * from the query string, and only the pack. An address is not a value to carry
 * in a shareable link, and the courier asks for it anyway.
 */
export function ReorderCta({ lastOrder }: { lastOrder?: Order }) {
	const to = lastOrder
		? `/stickers/order?pack=${encodeURIComponent(lastOrder.pack.id)}`
		: '/stickers/order'

	return (
		<Link
			to={to}
			className="bg-foreground text-background touch-target flex items-center gap-3 rounded-2xl p-4 transition-opacity hover:opacity-90"
		>
			<span className="bg-background/12 flex h-10.5 w-10.5 shrink-0 items-center justify-center rounded-xl">
				<Plus className="h-5 w-5" />
			</span>
			<span className="min-w-0 flex-1">
				<span className="block text-sm font-semibold">
					{lastOrder ? 'Commander à nouveau' : 'Commander des stickers'}
				</span>
				<span className="mt-0.5 block text-xs opacity-70">
					{lastOrder
						? `Le pack ${lastOrder.pack.name} vous attend déjà sélectionné.`
						: 'Payés à la livraison, en trois étapes.'}
				</span>
			</span>
			<ChevronRight className="h-4.5 w-4.5 shrink-0 opacity-60" />
		</Link>
	)
}
