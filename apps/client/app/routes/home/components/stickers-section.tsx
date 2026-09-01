import { Link } from 'react-router'
import { Check } from 'lucide-react'
import { cn } from '@app/ui/utils'
import {
	PAYMENT_ON_DELIVERY_LABEL,
	STICKER_PACKS,
} from '@app/contracts/sticker-orders'
import { StickerMark } from '@/components/sticker-mark'

/** The cheapest pack the API actually sells, never a figure written here. */
const FROM_PRICE = Math.min(...STICKER_PACKS.map(pack => pack.price))

// A narrow no-break space between the thousands, which `tracking-tight` would
// otherwise squash into « 2000 » — so this block never sets it.
const FROM_PRICE_LABEL = new Intl.NumberFormat('fr-FR').format(FROM_PRICE)

const FEATURES = ['Livré à Abidjan', 'Aucun paiement en ligne']

function PriceBadge({ className }: { className: string }) {
	return (
		<span
			className={cn(
				'bg-accent-orange text-accent-orange-foreground flex items-center rounded-full font-bold shadow-lg',
				className,
			)}
		>
			Dès {FROM_PRICE_LABEL} FCFA
		</span>
	)
}

/**
 * Position 2 on the home page: the product is what pays for the platform, and
 * it used to sit five screens down inside a decorative bento tile. Dark in both
 * themes on purpose — it is a product surface, not a themed page section, so it
 * carries a border in dark mode to stay a distinct surface on a near-black page.
 */
export function StickersSection() {
	return (
		<section className="py-2 sm:px-4 sm:py-7 lg:py-9">
			<div className="mx-auto max-w-6xl">
				<div className="dark:border-border grid gap-6 bg-neutral-900 px-[max(1rem,env(safe-area-inset-left))] py-7 pr-[max(1rem,env(safe-area-inset-right))] sm:gap-9 sm:rounded-3xl sm:px-8 sm:py-9 lg:grid-cols-[1fr_auto] lg:items-center lg:p-11 dark:border">
					<div className="flex flex-col gap-4">
						<div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
							<span className="bg-accent-orange/20 text-accent-orange-light flex h-6.5 items-center rounded-full px-2.5 text-xs font-semibold">
								Notre produit
							</span>
							<span className="text-xs text-white/60">
								{PAYMENT_ON_DELIVERY_LABEL}
							</span>
						</div>

						<div className="flex items-center gap-4 sm:gap-7">
							<div className="flex-1">
								<h2 className="text-[22px] leading-tight font-bold text-white sm:text-3xl lg:text-[2.125rem]">
									Un sticker QR sur vos objets qui comptent
								</h2>
								<p className="mt-2 max-w-lg text-[13.5px] leading-relaxed text-white/70 sm:text-base">
									Celui qui trouve scanne le code et vous joint en un geste.
									Votre numéro n&apos;apparaît jamais.
								</p>
							</div>

							{/* Under the sticker, not over it: overlapping covered its own
							    « Scanner si trouvé » label. */}
							<div className="flex shrink-0 flex-col items-center gap-2 lg:hidden">
								<StickerMark tone="light" className="h-32 w-27.5" />
								<PriceBadge className="h-7 px-2.5 text-xs" />
							</div>
						</div>

						<ul className="flex flex-wrap gap-x-5 gap-y-2">
							{FEATURES.map(feature => (
								<li
									key={feature}
									className="flex items-center gap-2 text-xs text-white/75 sm:text-sm"
								>
									<Check className="text-primary-green-light h-4 w-4 shrink-0" />
									{feature}
								</li>
							))}
						</ul>

						<div className="mt-1 flex flex-col gap-2.5 sm:flex-row">
							<Link
								to="/stickers/order"
								className="bg-accent-orange text-accent-orange-foreground hover:bg-accent-orange-dark flex h-13 items-center justify-center rounded-[14px] px-6 text-[15px] font-semibold transition-colors"
							>
								Commander mes stickers
							</Link>
							<Link
								to="/stickers"
								className="flex h-13 items-center justify-center rounded-[14px] border-[1.5px] border-white/25 px-6 text-[15px] font-semibold text-white transition-colors hover:bg-white/10"
							>
								Voir comment ça marche
							</Link>
						</div>
					</div>

					<div className="hidden shrink-0 flex-col items-center gap-3 lg:flex">
						<StickerMark tone="light" className="h-58 w-50" />
						<PriceBadge className="h-9 px-3.5 text-sm" />
					</div>
				</div>
			</div>
		</section>
	)
}
