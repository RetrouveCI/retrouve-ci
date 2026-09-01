import { Link } from 'react-router'
import { ChevronRight, Package } from 'lucide-react'
import {
	PAYMENT_ON_DELIVERY_LABEL,
	STICKER_PACKS,
} from '@app/contracts/sticker-orders'

/** The cheapest pack the API actually sells, never a figure written here. */
const FROM_PRICE = Math.min(...STICKER_PACKS.map(pack => pack.price))

export function OrderMoreCta({ hasStickers }: { hasStickers: boolean }) {
	return (
		<Link
			to="/stickers/order"
			className="bg-foreground text-background touch-target flex items-center gap-3 rounded-2xl p-4 transition-opacity hover:opacity-90"
		>
			<span className="bg-background/12 flex h-10.5 w-10.5 shrink-0 items-center justify-center rounded-xl">
				<Package className="h-5 w-5" />
			</span>
			<span className="min-w-0 flex-1">
				<span className="block text-sm font-semibold">
					{hasStickers
						? "Commander d'autres stickers"
						: 'Commander des stickers'}
				</span>
				<span className="mt-0.5 block text-xs opacity-70">
					Dès {new Intl.NumberFormat('fr-FR').format(FROM_PRICE)} FCFA,{' '}
					{PAYMENT_ON_DELIVERY_LABEL.toLowerCase()}.
				</span>
			</span>
			<ChevronRight className="h-4.5 w-4.5 shrink-0 opacity-60" />
		</Link>
	)
}
