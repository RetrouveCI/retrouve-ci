import { Link } from 'react-router'
import { Package, ScanLine } from 'lucide-react'

/**
 * It appears while a delivered pack still holds stickers nobody has named, and
 * disappears on the twelfth activation without anybody dismissing it — a
 * permanent floating bubble is what the refonte removed with `ActivityHub`.
 * Dark in both themes, so `bg-foreground` is out: it would invert and take the
 * ink with it.
 */
export function StickerActivationBanner({ pending }: { pending: number }) {
	return (
		<section className="container mx-auto px-4 pt-4">
			<div className="rounded-2xl bg-neutral-900 p-4 dark:border">
				<div className="flex items-start gap-3">
					<span className="bg-accent-orange flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
						<Package
							className="text-accent-orange-foreground h-5.5 w-5.5"
							strokeWidth={2}
						/>
					</span>
					<div className="min-w-0 flex-1">
						<p className="font-bold text-white">
							{pending === 1
								? 'Un sticker attend son objet'
								: `Vos ${pending} stickers sont arrivés`}
						</p>
						<p className="mt-0.5 text-sm text-neutral-300">
							{pending === 1
								? 'Scannez-le pour lui donner un nom.'
								: 'Scannez-les un par un pour les activer. Comptez une minute.'}
						</p>
					</div>
				</div>
				<Link
					to="/scan"
					className="bg-accent-orange text-accent-orange-foreground h-control mt-3 flex w-full items-center justify-center gap-2 rounded-xl font-semibold"
				>
					<ScanLine className="h-4.5 w-4.5" />
					Commencer à scanner
				</Link>
			</div>
		</section>
	)
}
